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

