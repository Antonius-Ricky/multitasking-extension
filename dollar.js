const API_KEY = "99b8f8edee94d47ace3b72f3"; 
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;

let exchangeRate = 0;
let isUpdating = false;

document.addEventListener("DOMContentLoaded", () => {
    fetchExchangeRate();
    
    document.getElementById("usdInput").addEventListener("input", () => convertCurrency("usd"));
    document.getElementById("idrInput").addEventListener("input", () => convertCurrency("idr"));
});

function fetchExchangeRate() {
    fetch(API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data || !data.conversion_rates || !data.conversion_rates.IDR) {
                throw new Error("Invalid API response format");
            }
            exchangeRate = data.conversion_rates.IDR;
            document.getElementById("rateDisplay").innerText = `1 USD = ${exchangeRate} IDR`;
        })
        .catch(error => {
            console.error("Error fetching exchange rate:", error);
            document.getElementById("rateDisplay").innerText = "Failed to fetch exchange rate.";
        });
}

function convertCurrency(type) {
    if (isUpdating) return;
    isUpdating = true;

    let usdInput = document.getElementById("usdInput");
    let idrInput = document.getElementById("idrInput");

    if (type === "usd") {
        let usdAmount = parseFloat(usdInput.value);
        if (!isNaN(usdAmount)) {
            idrInput.value = (usdAmount * exchangeRate).toFixed(2);
        } else {
            idrInput.value = "";
        }
    } else if (type === "idr") {
        let idrAmount = parseFloat(idrInput.value);
        if (!isNaN(idrAmount)) {
            usdInput.value = (idrAmount / exchangeRate).toFixed(2);
        } else {
            usdInput.value = "";
        }
    }

    isUpdating = false;
}
