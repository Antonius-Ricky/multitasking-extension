chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");

  chrome.contextMenus.create({
    id: "defineWord",
    title: "Define '%s'",
    contexts: ["selection"]
  });

  console.log("Context menu created");
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "defineWord" && info.selectionText) {
    const word = info.selectionText.trim();
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const definition = data?.[0]?.meanings?.[0]?.definitions?.[0]?.definition || "Definition not found";
      const pronunciation = data?.[0]?.phonetic || "Pronunciation not available";

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: displayPopup,
        args: [word, definition, pronunciation]
      });
    } catch (error) {
      console.error("Error fetching definition:", error);
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: displayPopup,
        args: [word, "Error fetching definition", "N/A"]
      });
    }
  }
});


function displayPopup(word, definition, pronunciation) {
  const existingPopup = document.getElementById("word-definition-popup");
  if (existingPopup) existingPopup.remove();

  const div = document.createElement("div");
  div.id = "word-definition-popup";
  div.style.position = "fixed";
  div.style.bottom = "20px";
  div.style.right = "20px";
  div.style.padding = "10px";
  div.style.backgroundColor = "#1E1E2E";
  div.style.border = "1px solid #ccc";
  div.style.borderRadius = "8px";
  div.style.color = "#fff";
  div.style.boxShadow = "0 2px 5px rgba(0,0,0,0.3)";
  div.style.zIndex = "10000";
  div.style.maxWidth = "300px";
  div.style.fontFamily = "Arial, sans-serif";

  div.innerHTML = `
    <strong style="font-size: 16px; color: #a144db;">${word}</strong>
    <p style="margin: 5px 0; font-size: 14px;"><strong>Pronunciation:</strong> ${pronunciation}</p>
    <p style="margin: 5px 0; font-size: 14px;"><strong>Definition:</strong> ${definition}</p>
    <button id="close-popup" style="
      margin-top: 10px;
      padding: 5px 10px;
      background-color: #007BFF;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    ">Close</button>
  `;

  document.body.appendChild(div);
  document.getElementById("close-popup").addEventListener("click", () => div.remove());
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getWeather") {
    fetchWeatherData().then(data => {
      if (data) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs.length > 0) {
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              func: displayWeatherPopup,
              args: [data]
            });
          }
        });
      }
      sendResponse({ success: true, data });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
});

async function fetchWeatherData() {
  try {
    const ipData = await getIP();
    if (!ipData || !ipData.latitude || !ipData.longitude) {
      throw new Error("Failed to get location.");
    }

    const lat = ipData.latitude;
    const lon = ipData.longitude;
    const API_KEY = '47e28d589c912d35b8aed44a6681c3c2';

    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    if (!response.ok) {
      throw new Error(`Weather API error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Weather fetch error:", error);
    return null;
  }
}

async function getIP() {
  try {
    const API_KEY = 'c5353e5225f64d51895f9dde3389ca97';
    const response = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${API_KEY}`);
    if (!response.ok) {
      throw new Error(`IP API error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("IP fetch error:", error);
    return null;
  }
}

function displayWeatherPopup(weatherData) {
  const existingPopup = document.getElementById("weather-popup");
  if (existingPopup) existingPopup.remove();

  const { name, main, weather, wind } = weatherData;
  const temperature = main?.temp ? `${main.temp}°C` : "N/A";
  const condition = weather?.[0]?.description || "Unknown";
  const humidity = main?.humidity ? `${main.humidity}%` : "N/A";
  const windSpeed = wind?.speed ? `${wind.speed} km/h` : "N/A";

  // Correctly fetch image URLs
  const thermometerIcon = chrome.runtime.getURL("images/thermometer.png");
  const windIcon = chrome.runtime.getURL("images/Wind.png");
  const humidityIcon = chrome.runtime.getURL("images/Humidity.png");
  const cloudIcon = chrome.runtime.getURL("images/cloud.png");

  const div = document.createElement("div");
  div.id = "weather-popup";
  div.style.position = "fixed";
  div.style.bottom = "20px";
  div.style.right = "20px";
  div.style.padding = "10px";
  div.style.backgroundColor = "#1E1E2E";
  div.style.border = "1px solid #ccc";
  div.style.borderRadius = "8px";
  div.style.color = "#fff";
  div.style.boxShadow = "0 2px 5px rgba(0,0,0,0.3)";
  div.style.zIndex = "10000";
  div.style.minWidth = "300px";
  div.style.fontFamily = "Arial, sans-serif";

  div.innerHTML = `
    <strong style="font-size: 16px; color: #a144db;">Weather in ${name}</strong>
    <p style="margin: 5px 0; font-size: 14px;">
      <img src="${thermometerIcon}" alt="Temperature" width="25"> 
      <strong>Temperature:</strong> ${temperature}
    </p>
    <p style="margin: 5px 0; font-size: 14px;">
      <img src="${windIcon}" alt="Wind Speed" width="25"> 
      <strong>Wind Speed:</strong> ${windSpeed}
    </p>
    <p style="margin: 5px 0; font-size: 14px;">
      <img src="${humidityIcon}" alt="Humidity" width="25"> 
      <strong>Humidity:</strong> ${humidity}
    </p>
    <p style="margin: 5px 0; font-size: 14px;">
      <img src="${cloudIcon}" alt="Humidity" width="25"> 
      <strong>Condition:</strong> ${condition}
    </p>
    <button id="close-weather-popup" style="
      margin-top: 10px;
      padding: 5px 10px;
      background-color: #007BFF;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    ">Close</button>
  `;

  document.body.appendChild(div);
  document.getElementById("close-weather-popup").addEventListener("click", () => div.remove());

}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "convertCurrency") {
      const { amount, fromCurrency, toCurrency } = message;
      const apiKey = "99b8f8edee94d47ace3b72f3";
      const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency}`;

      console.log("Fetching currency conversion:", { amount, fromCurrency, toCurrency });

      fetch(url)
          .then(response => response.json())
          .then(data => {
              console.log("API Response:", data);

              if (data.conversion_rates && data.conversion_rates[toCurrency]) {
                  const rate = data.conversion_rates[toCurrency];
                  const convertedAmount = (amount * rate).toFixed(2);

                  // Kirim pesan ke tab aktif untuk menampilkan pop-up
                  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                      if (tabs.length > 0) {
                          chrome.scripting.executeScript({
                              target: { tabId: tabs[0].id },
                              func: displayCurrencyPopup,
                              args: [amount, fromCurrency, convertedAmount, toCurrency, rate]
                          });
                      }
                  });

                  sendResponse({ success: true, convertedAmount, rate });
              } else {
                  sendResponse({ success: false, error: "Conversion rate not found" });
              }
          })
          .catch(error => {
              console.error("Error fetching currency data:", error);
              sendResponse({ success: false, error: error.message });
          });

      return true;
  }
});

// Fungsi untuk menampilkan pop-up hasil konversi
function displayCurrencyPopup(amount, fromCurrency, convertedAmount, toCurrency, rate) {
  const existingPopup = document.getElementById("currency-popup");
  if (existingPopup) existingPopup.remove();

  const div = document.createElement("div");
  div.id = "currency-popup";
  div.style.position = "fixed";
  div.style.bottom = "20px";
  div.style.right = "20px";
  div.style.padding = "10px";
  div.style.backgroundColor = "#1E1E2E";
  div.style.border = "1px solid #ccc";
  div.style.borderRadius = "8px";
  div.style.color = "#fff";
  div.style.boxShadow = "0 2px 5px rgba(0,0,0,0.3)";
  div.style.zIndex = "10000";
  div.style.minWidth = "300px";
  div.style.fontFamily = "Arial, sans-serif";

  div.innerHTML = `
      <strong style="font-size: 16px; color: #a144db;">Currency Conversion</strong>
      <p style="margin: 5px 0; font-size: 14px;"><strong>Amount:</strong> ${amount} ${fromCurrency}</p>
      <p style="margin: 5px 0; font-size: 14px;"><strong>Converted:</strong> ${convertedAmount} ${toCurrency}</p>
      <p style="margin: 5px 0; font-size: 14px;"><strong>Exchange Rate:</strong> 1 ${fromCurrency} = ${rate} ${toCurrency}</p>
      <button id="close-currency-popup" style="
          margin-top: 10px;
          padding: 5px 10px;
          background-color: #007BFF;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
      ">Close</button>
  `;

  document.body.appendChild(div);
  document.getElementById("close-currency-popup").addEventListener("click", () => div.remove());
}


  



chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(["sidebarOpen"], (data) => {
    if (data.sidebarOpen) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ["sidebar.js"]
          });
        }
      });
    }
  });
});
