async function fetchWeather() {
    const apiKey = "c5353e5225f64d51895f9dde3389ca97";
    try {
        const response = await fetch("https://ipapi.co/json/");
        const locationData = await response.json();
        const lat = locationData.latitude;
        const lon = locationData.longitude;
        
        const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );
        const weatherData = await weatherResponse.json();

        if (weatherData.cod === 200) {
            document.getElementById("weather-info").innerHTML = `
                <h3>Weather in ${weatherData.name}</h3>
                <p>${weatherData.weather[0].description}</p>
                <p>🌡 Temp: ${weatherData.main.temp}°C</p>
                <p>💨 Wind: ${weatherData.wind.speed} km/h</p>
                <p>🌅 Humidity: ${weatherData.main.humidity}%</p>
            `;
        } else {
            document.getElementById("weather-info").innerHTML = `<p>Error fetching weather data</p>`;
        }
    } catch (error) {
        console.error("Error fetching weather:", error);
        document.getElementById("weather-info").innerHTML = `<p>Failed to load weather data</p>`;
    }
}

document.addEventListener("DOMContentLoaded", fetchWeather);
