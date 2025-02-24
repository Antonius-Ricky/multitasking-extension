document.addEventListener("DOMContentLoaded", function () {
    const apiKey = "c5353e5225f64d51895f9dde3389ca97"; 
    const lat = -2.9170;
    const lon = 104.7285;
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
            document.getElementById("temp").innerText = `${Math.round(data.main.temp)}°C`;
            document.getElementById("location").innerText = data.name;
            document.getElementById("cloud_info").innerText = data.weather[0].description;
            document.getElementById("wind_speed").innerText = `${data.wind.speed} km/h`;
            document.getElementById("pressure").innerText = `${data.main.pressure} hPa`;
            document.getElementById("humidity").innerText = `${data.main.humidity}%`;

            // Menyesuaikan waktu sesuai zona WIB (GMT+7)
            const now = new Date();
            now.setHours(now.getUTCHours() + 7);
            document.getElementById("time").innerText = now.toLocaleString("id-ID", {
                weekday: "short",
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "short"
            });
        })
        .catch(error => console.error("Error fetching weather data:", error));
});
