// Show Sidebar
function showSidebar() {
    if (!document.getElementById("my-sidebar")) {
        const sidebar = document.createElement("div");
        sidebar.id = "my-sidebar";
        sidebar.innerHTML = `
          <div id="sidebar-header">
            <h2>Multitasking Sidebar</h2>
            <button id="close-sidebar">×</button>
          </div>

          <div id="sidebar-content">
            <h3>To-Do List</h3>
            <ul id="task-list"></ul>
            <input type="text" id="task-input" placeholder="New Task">
            <button id="add-task">Add</button>

            <h3>Tools</h3>
            <div class="tool-buttons">
              <button id="weather-btn" class="icon-box">
                <img src="${chrome.runtime.getURL("images/cloud_logo.png")}" alt="Weather" width="25"> 
              </button>
              <button id="currency-btn" class="icon-box">
                <img src="${chrome.runtime.getURL("images/currency.png")}" alt="Currency" width="25"> 
              </button>
            </div>

            <div id="currency-section" style="display: none;">
              <h3>Currency Converter</h3>
              <input type="number" id="amount-input" placeholder="Enter amount in USD">
              <button id="convert-btn">Convert</button>
              <div id="conversion-result"></div>
            </div>
          </div>
        `;

        document.body.appendChild(sidebar);

        const taskList = document.getElementById("task-list");
        const taskInput = document.getElementById("task-input");

        function loadTasks() {
            chrome.storage.local.get(["tasks"], (result) => {
                taskList.innerHTML = "";
                (result.tasks || []).forEach((task) => {
                    addTaskToUI(task);
                });
            });
        }

        function addTaskToUI(task) {
            const li = document.createElement("li");
            li.innerHTML = `${task} <button class="delete-task">❌</button>`;
            taskList.appendChild(li);
        }

        function saveTask(task) {
            chrome.storage.local.get(["tasks"], (result) => {
                const tasks = result.tasks || [];
                tasks.push(task);
                chrome.storage.local.set({ tasks });
            });
        }

        function removeTask(taskText) {
            chrome.storage.local.get(["tasks"], (result) => {
                let tasks = result.tasks || [];
                tasks = tasks.filter((t) => t !== taskText);
                chrome.storage.local.set({ tasks });
                loadTasks();
            });
        }

        document.getElementById("add-task").addEventListener("click", () => {
            const taskText = taskInput.value.trim();
            if (taskText) {
                addTaskToUI(taskText);
                saveTask(taskText);
                taskInput.value = "";
            }
        });

        document.addEventListener("click", (e) => {
            if (e.target.classList.contains("delete-task")) {
                const taskText = e.target.parentElement.textContent.replace("❌", "").trim();
                removeTask(taskText);
                e.target.parentElement.remove();
            }
        });

        loadTasks();

        document.getElementById("close-sidebar").addEventListener("click", () => {
            sidebar.remove();
            chrome.storage.local.set({ sidebarOpen: false });
            document.getElementById("floating-icon").style.display = "flex";
        });

        document.getElementById("weather-btn").addEventListener("click", () => {
            chrome.runtime.sendMessage({ action: "getWeather" });
        });
        // Show Currency Converter Input
        document.getElementById("currency-btn").addEventListener("click", () => {
            document.getElementById("currency-section").style.display = "block";
        });

        // Handle Currency Conversion
        document.getElementById("convert-btn").addEventListener("click", () => {
            const amountInput = document.getElementById("amount-input");
            const resultDiv = document.getElementById("conversion-result");

            const amount = parseFloat(amountInput.value);
            if (!amount || isNaN(amount)) {
                resultDiv.innerHTML = "<p style='color: red;'>Please enter a valid amount.</p>";
                return;
            }

            chrome.runtime.sendMessage({
                action: "convertCurrency",
                amount: amount,
                fromCurrency: "USD",
                toCurrency: "IDR"
            }, (response) => {
                if (response && response.success) {
                    resultDiv.innerHTML = `
                        <p><strong>Converted Amount:</strong> ${response.convertedAmount} IDR</p>
                        <p><strong>Exchange Rate:</strong> 1 USD = ${response.rate} IDR</p>
                    `;
                } else {
                    resultDiv.innerHTML = "<p style='color: red;'>Failed to convert currency.</p>";
                }
            });
        });
    }

    chrome.storage.local.set({ sidebarOpen: true });
}

// Floating Button
if (!document.getElementById("floating-icon")) {
    const floatingButton = document.createElement("div");
    floatingButton.id = "floating-icon";
    floatingButton.innerHTML = `<img src="${chrome.runtime.getURL("icons/icon48.png")}" alt="Sidebar Icon">`;
    floatingButton.style.position = "fixed";
    floatingButton.style.bottom = "20px";
    floatingButton.style.right = "20px";
    floatingButton.style.width = "50px";
    floatingButton.style.height = "50px";
    floatingButton.style.cursor = "pointer";
    floatingButton.style.borderRadius = "50%";
    floatingButton.style.boxShadow = "0 2px 5px rgba(0,0,0,0.3)";
    floatingButton.style.backgroundColor = "#fff";
    floatingButton.style.display = "none";
    floatingButton.style.justifyContent = "center";
    floatingButton.style.alignItems = "center";
    floatingButton.style.zIndex = "10000";

    document.body.appendChild(floatingButton);

    floatingButton.addEventListener("click", () => {
        floatingButton.style.display = "none";
        showSidebar();
    });
}

chrome.storage.local.get(["sidebarOpen"], (data) => {
    if (data.sidebarOpen) {
        showSidebar();
    } else {
        document.getElementById("floating-icon").style.display = "flex";
    }
});
