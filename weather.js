function updateTime() {
    const now = new Date();
    now.setHours(now.getHours());
    const options = { 
        weekday: 'short', 
        hour: '2-digit', 
        minute: '2-digit', 
        day: '2-digit', 
        month: 'short' 
    };
    const formattedTime = now.toLocaleString('en-US', options);
    document.getElementById("time").innerText = formattedTime;
}

document.addEventListener("DOMContentLoaded", updateTime);

async function makeRequest(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Request failed:", error);
        return null;
    }
}

async function getIP() {
    const API_KEY = 'c5353e5225f64d51895f9dde3389ca97';
    return await makeRequest(`https://api.ipgeolocation.io/ipgeo?apiKey=${API_KEY}`);
}

async function getWeather() {
    const ipData = await getIP(); // Gunakan await agar mendapatkan hasilnya
    if (!ipData || !ipData.latitude || !ipData.longitude) {
        console.error("Gagal mendapatkan lokasi");
        return null;
    }

    const lat = ipData.latitude;
    const lon = ipData.longitude;
    const API_KEY = '47e28d589c912d35b8aed44a6681c3c2';

    return await makeRequest(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
}

async function displayParameters() {
    const weather = await getWeather();
    if (!weather) return;
    
    document.getElementById("temp").innerText = `${Math.round(weather.main.temp_min)}°`;
    document.getElementById("location").innerText = weather.name;
    document.getElementById("cloud_info").innerText = weather.weather[0].description.charAt(0).toUpperCase() + weather.weather[0].description.slice(1);
    document.getElementById("wind_speed").innerText = `${weather.wind.speed} km/h`;
    document.getElementById("pressure").innerText = `${weather.main.pressure} hPa`;
    document.getElementById("humidity").innerText = `${weather.main.humidity}%`;
}

document.addEventListener("DOMContentLoaded", displayParameters);
