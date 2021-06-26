// api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key}&units={unit}
// toggle unit
// http://api.openweathermap.org/geo/1.0/direct?q=London&limit=5&appid={API key}

import { fromUnixTime } from "date-fns";
import { utcToZonedTime, format } from "date-fns-tz";

const searchForm = document.getElementById("location_input");
const searchContainer = document.getElementById("searchForm_container");
const currentWeatherContainer = document.getElementById("current_weather_container");
const forecastContainer = document.getElementById("forecast_container");
const unitSwitch = document.getElementById("unit_switch");
searchForm.addEventListener("submit", getFormInput);
unitSwitch.addEventListener("change", () => {
  console.log("here");
});

const dataKeeper = {
  search: "",
  currentWeather: "",
  forecastWeather: "",
};

function getFormInput(e) {
  e.preventDefault();
  const error = document.getElementById("location_error_text");
  if (error != null) error.remove();
  let locationInfo = fetchLocationCoords(e.target[0].value);
  let unitSelect = unitSwitch.checked ? "Metric" : "Imperial";
  locationInfo.then((values) => {
    currentWeatherContainer.querySelector(
      "#loc_name"
    ).innerText = `${values.locName}, ${values.country}`;
    fetchWeatherData(values.lat, values.lon, unitSelect);
  });
}

async function fetchLocationCoords(location) {
  const geoAPI = `http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=5&appid=${
    apiK + ey
  }`;
  let geoData = undefined;
  try {
    geoData = await fetch(geoAPI, { mode: "cors" });
    geoData = await geoData.json();
  } catch (error) {
    console.log(error);
  }
  if (geoData[0] === undefined) {
    let error = document.createElement("p");
    error.id = "location_error_text";
    error.innerText = "Location not found.";
    searchContainer.appendChild(error);
    return;
  }
  searchForm.reset();
  const { lat, lon, name: locName, country } = geoData[0];
  console.log(geoData);
  return { lat, lon, locName, country };
}

async function fetchWeatherData(lat, lon, unit) {
  const weatherAPI = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${
    apiK + ey
  }&units=${unit}`;
  let weatherData = undefined;
  try {
    let dataJson = await fetch(weatherAPI, { mode: "cors" });
    weatherData = await dataJson.json();
  } catch (error) {
    console.log(error);
  }
  parseWeatherData(weatherData);
}

function parseWeatherData(data) {
  console.log(data);
  displayCurrentData(data.current, data.timezone);
  displayForecastData(data.daily, data.timezone);
}

function displayCurrentData(currentWeather, timezone) {
  const currentData = {
    hum: currentWeather.humidity,
    temp: currentWeather.temp,
    feels: currentWeather.feels_like,
    windDir: currentWeather.wind_deg,
    windSp: currentWeather.wind_speed,
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
    rain.innerText = `${currentWeather.rain["1h"]}mm`;
  }
  if (currentWeather.snow !== undefined) {
    let snow = currentWeatherContainer.querySelector(`#current_snow`);
    snow.style.display = "Block";
    snow.innerText = `${currentWeather.snow["1h"]}mm`;
  }
}

function displayForecastData(forecast, timezone) {
  console.log(forecast);
  let daysList = forecastContainer.querySelector(`#forecast_list`);
  daysList.innerHTML = "";
  forecast.forEach((day) => {
    let individualDay = document.createElement("li");
    individualDay.style.display = "flex";
    let forcastDate = format(utcToZonedTime(day.dt * 1000, timezone), "dd.MM", {
      timeZone: timezone,
    });
    individualDay.innerHTML = `<li>${forcastDate}</li>|<li>${day.temp.min} min</li>|<li>${day.temp.max} max</li>|<li>${day.pop} preci</li>`;
    daysList.appendChild(individualDay);
  });
}
