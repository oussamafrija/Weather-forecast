const searchButton = document.querySelector(".search-btn");
const cityInput = document.querySelector(".city-input");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "1a91dc9c7745111e13dd8c755ec78d26"; //My API key for openweathermap API
const createWeatherCard = (cityName, weatherItem, index) => {
    if(index === 0){ //HTML for main weather card
        return `<div class="details">
                    <h2>${cityName} , ${weatherItem.dt_txt.split(" ")[0]}</h2>
                    <h4>Temperature: ${(weatherItem.main.temp)} °C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} km/h</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png">
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>`;
    }
    else{ //HTML for other five days forecast cards
        return `<li class="card">
                <h3> ${weatherItem.dt_txt.split(" ")[0]} </h3>
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                <h4>Temp: ${(weatherItem.main.temp)} °C</h4>
                <h4>Wind: ${weatherItem.wind.speed} km/h</h4>
                <h4>Humidity: ${weatherItem.main.humidity} %</h4>
            </li>`;
    }
    
}


const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast/?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {

        // Filter the forecasts to get only one forecast per day
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        })

        // to clear previous weather Data
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        //Creating weather cards and adding them to the DOM
        fiveDaysForecast.forEach((weatherItem, index) => {
            if(index === 0){
                currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            }
            else{
                weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            }
        });
    }).catch(() => {
        alert("An Alert occurred while fetching the wether forecast!");
    });
}

const getCityCoordinates = () =>{
    const cityName = cityInput.value.trim(); //get user's entered city name and removing extra spaces 
    if(!cityName) return;

    const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    //get entered city coordinates (latitude, longitude and name) from the API response
    fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
        if(!data.length) return alert(`No coordinates found for ${cityName}`);
        const {name, lat, lon} = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("An Alert occurred while fetching the coordinates!");
    });
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const {latitude, longitude} = position.coords;
            const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            
            // Get city name from coordinates using reverse geocoding API
            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
                if(!data.length) return alert(`No coordinates found for ${cityName}`);
                const {name} = data[0];
                getWeatherDetails(name, latitude, longitude);
            }).catch(() => {
                alert("An Alert occurred while fetching the city!");
            });
        },
        error => {
            if(error.code === error.PERMISSION_DENIED){
                alert("Geolocation request denied, please grant access");
            }
        }
    );
}

searchButton.addEventListener("click", getCityCoordinates);
locationButton.addEventListener("click", getUserCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());
