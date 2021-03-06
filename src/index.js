import { utcToZonedTime, format } from "date-fns-tz";

const headerText = document.getElementById("greeting_header");
const searchForm = document.getElementById("location_input");
const searchContainer = document.getElementById("searchForm_container");
const currentWeatherContainer = document.getElementById("current_weather_container");
const forecastContainer = document.getElementById("forecast_container");
const unitSwitch = document.getElementById("unit_switch");
const locationName = document.getElementById("loc_name");
const formButton = document.getElementById("location_button");
searchForm.addEventListener("submit", getFormInput);
unitSwitch.addEventListener("change", (e) => {
  if (searchForm[0].value !== "") {
    formButton.click();
    e.target.disabled = true;
    setTimeout(() => (e.target.disabled = false), 3000);
  }
});

function getFormInput(e) {
  e.preventDefault();
  let formError = searchContainer.querySelector("p");
  if (formError != null) formError.remove();
  let locationInfo = fetchLocationCoords(e.target[0].value);
  locationInfo.then((values) => {
    locationName.innerText = `${values.locName}, ${values.country}`;
    fetchWeatherData(values.lat, values.lon);
    headerText.innerText = "Loading...";
  });
}

async function fetchLocationCoords(location) {
  const geoAPI = `https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=5&appid=${apiK}`;
  try {
    let geoData = await fetch(geoAPI, { mode: "cors" });
    if (geoData.ok) {
      geoData = await geoData.json();
      if (geoData.length !== 0) {
        const { lat, lon, name: locName, country } = geoData[0];
        return { lat, lon, locName, country };
      } else {
        throw new Error("Location not found.");
      }
    } else {
      throw new Error(geoData.statusText);
    }
  } catch (error) {
    let formError = document.createElement("p");
    formError.innerText = `${error}`;
    searchContainer.appendChild(formError);
  }
}

async function fetchWeatherData(lat, lon) {
  let unitSelect = !unitSwitch.checked ? "Metric" : "Imperial";
  const weatherAPI = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiK}&units=${unitSelect}`;
  try {
    let weatherData = await fetch(weatherAPI, { mode: "cors" });
    if (weatherData.ok) {
      weatherData = await weatherData.json();
      parseWeatherData(weatherData);
    } else {
      throw new Error(weatherData.statusText);
    }
  } catch (error) {
    console.log(error);
  }
}

function parseWeatherData(data) {
  headerText.style.display = "none";
  document.getElementById("daily_header").style.display = "Block";
  displayCurrentData(data.current, data.timezone);
  displayForecastData(data.daily, data.timezone);
}

function displayCurrentData(currentWeather, timezone) {
  let unitValue = `??${unitSwitch.checked ? "F" : "C"}`;
  const currentData = {
    hum: `Humidity ${currentWeather.humidity}%`,
    temp: `${currentWeather.temp} ${unitValue}`,
    feels: `Feels Like ${currentWeather.feels_like} ${unitValue}`,
  };
  let myTime = utcToZonedTime(currentWeather.dt * 1000, timezone);
  currentWeatherContainer.querySelector("#loc_time").innerText = format(
    myTime,
    "dd.MM.yyyy', 'HH:mm aa zzz",
    { timeZone: timezone }
  );
  for (const value in currentData) {
    currentWeatherContainer.querySelector(`#current_${value}`).innerText = currentData[value];
  }
  if (currentWeather.rain !== undefined) {
    let rain = currentWeatherContainer.querySelector(`#current_rain`);
    rain.style.display = "Block";
    rain.innerText = `${currentWeather.rain["1h"]}mm of Rain`;
  }
  if (currentWeather.snow !== undefined) {
    let snow = currentWeatherContainer.querySelector(`#current_snow`);
    snow.style.display = "Block";
    snow.innerText = `${currentWeather.snow["1h"]}mm of Snow`;
  }
}

function displayForecastData(forecast, timezone) {
  let unitValue = `??${unitSwitch.checked ? "C" : "F"}`;
  let daysList = forecastContainer.querySelector(`#forecast_list`);
  daysList.innerHTML = "";
  forecast.forEach((day) => {
    let individualDay = document.createElement("li");
    individualDay.className = "forecast_day";
    let forcastDate = format(utcToZonedTime(day.dt * 1000, timezone), "dd/MM", {
      timeZone: timezone,
    });
    individualDay.innerHTML = `
    <p>${forcastDate} </p>
    <li>Min <span>${day.temp.min} ${unitValue}</span></li>
    <li>Max <span>${day.temp.max} ${unitValue}</span></li>
    <li>Rain/Snow <span>${day.pop}%</span></li>`;
    daysList.appendChild(individualDay);
  });
}
