// api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key}&units={unit}
// toggle unit
// http://api.openweathermap.org/geo/1.0/direct?q=London&limit=5&appid={API key}

import { fromUnixTime, format } from "date-fns";

const unitSelection = "Metric";
const searchForm = document.getElementById("location_input");
const searchContainer = document.getElementById("searchForm_container");
const currentWeatherContainer = document.getElementById("current_weather_container");
searchForm.addEventListener("submit", getFormInput);

function getFormInput(e) {
  e.preventDefault();
  const error = document.getElementById("location_error_text");
  if (error != null) error.remove();
  let locationInfo = fetchLocationCoords(e.target[0].value);
  locationInfo.then((values) => {
    currentWeatherContainer.querySelector("#loc_name").innerText = values.locName;
    fetchWeatherData(values.lat, values.lon, unitSelection);
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
  const { lat, lon, name: locName } = geoData[0];
  return { lat, lon, locName };
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
  displayCurrentData(data.current, data.timezone);
  displayForecastData();
  console.log(data);
}

function displayCurrentData(currentWeather, timezone) {
  const currentData = {
    hum: currentWeather.humidity,
    temp: currentWeather.temp,
    feels: currentWeather.feels_like,
    windDir: currentWeather.wind_deg,
    windSp: currentWeather.wind_speed,
  };
  currentWeatherContainer.querySelector("#loc_time").innerText = format(
    fromUnixTime(currentWeather.dt),
    "d.M.yyyy HH:mm:ss.SSS",
    { timezone: timezone }
  );
  for (const value in currentData) {
    currentWeatherContainer.querySelector(`#current_${value}`).innerText = currentData[value];
  }
}
