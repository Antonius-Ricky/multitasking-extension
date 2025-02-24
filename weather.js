document.addEventListener("DOMContentLoaded", () => {
    const apiKey = "c5353e5225f64d51895f9dde3389ca97";
    
    function fetchWeather(lat, lon) {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                document.getElementById("temp").innerText = `${Math.round(data.main.temp)}°C`;
                document.getElementById("location").innerText = data.name;
                document.getElementById("cloud_info").innerText = data.weather[0].description;
                document.getElementById("wind_speed").innerText = `${data.wind.speed} km/h`;
                document.getElementById("pressure").innerText = `${data.main.pressure} hPa`;
                document.getElementById("humidity").innerText = `${data.main.humidity}%`;
            })
            .catch(error => console.error("Error fetching weather data:", error));
    }
    
    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                fetchWeather(position.coords.latitude, position.coords.longitude);
            }, () => {
                console.error("Geolocation permission denied.");
            });
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    }
    
    getLocation();
});
