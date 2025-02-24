document.addEventListener("DOMContentLoaded", () => {
    const recentSearchesList = document.getElementById("recent-searches");
  
    chrome.storage.local.get(["recentSearches"], (result) => {
      const recentSearches = result.recentSearches || [];
      if (recentSearches.length > 0) {
        recentSearches.forEach((word) => {
          const listItem = document.createElement("li");
          listItem.textContent = word;
          recentSearchesList.appendChild(listItem);
        });
      } else {
        recentSearchesList.innerHTML = "<li>No recent searches</li>";
      }
    });
  
  
    const clearButton = document.getElementById("clear-history");
    clearButton.addEventListener("click", () => {
      chrome.storage.local.set({ recentSearches: [] }, () => {
        recentSearchesList.innerHTML = "<li>No recent searches</li>";
      });
    });
  });
  