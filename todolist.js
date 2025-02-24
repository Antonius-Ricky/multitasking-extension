document.addEventListener("DOMContentLoaded", () => {
    const taskInput = document.getElementById("task-input");
    const addTaskButton = document.getElementById("add-task");
    const taskList = document.getElementById("task-list");

    function loadTasks() {
        chrome.storage.local.get(["tasks"], (result) => {
            taskList.innerHTML = "";
            (result.tasks || []).forEach((task) => {
                const li = document.createElement("li");
                li.textContent = task;
                taskList.appendChild(li);
            });
        });
    }

    addTaskButton.addEventListener("click", () => {
        const task = taskInput.value.trim();
        if (task) {
            chrome.storage.local.get(["tasks"], (result) => {
                const tasks = result.tasks || [];
                tasks.push(task);
                chrome.storage.local.set({ tasks }, loadTasks);
                taskInput.value = "";
            });
        }
    });

    loadTasks();
});
