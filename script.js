// Load saved tasks from browser storage.
let tasks = [];

try {
    const savedTasks = localStorage.getItem("studentTasks");
    const parsedTasks = savedTasks ? JSON.parse(savedTasks) : [];

    if (Array.isArray(parsedTasks)) {
        tasks = parsedTasks.filter(task =>
            task &&
            typeof task.id === "string" &&
            typeof task.name === "string" &&
            Number.isFinite(task.hours) &&
            task.hours > 0 &&
            ["Doing", "On Hold", "Completed"].includes(task.status)
        );
    }
} catch (error) {
    console.error("Could not load saved tasks:", error);
}

// HTML elements.
const taskForm = document.getElementById("taskForm");
const taskNameInput = document.getElementById("taskName");
const taskHoursInput = document.getElementById("taskHours");

const activeTasksContainer = document.getElementById("activeTasks");
const completedListContainer = document.getElementById("completedList");

const totalTasksElement = document.getElementById("totalTasks");
const completedTasksElement = document.getElementById("completedTasks");
const totalHoursElement = document.getElementById("totalHours");

const activeCountElement = document.getElementById("activeCount");
const completedCountElement = document.getElementById("completedCount");


// Save tasks to browser storage.
function saveTasks() {
    try {
        localStorage.setItem("studentTasks", JSON.stringify(tasks));
    } catch (error) {
        console.error("Could not save tasks:", error);
        alert("Unable to save tasks in this browser.");
    }
}


// Create an HTML element safely.
function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text !== undefined) {
        element.textContent = text;
    }

    return element;
}


// Create a task card.
function createTaskCard(task, completed = false) {
    const card = createElement(
        "article",
        `task-card ${completed
            ? "status-completed completed-task"
            : task.status === "Doing"
                ? "status-doing"
                : "status-on-hold"}`
    );

    const info = createElement("div", "task-info");

    const title = createElement("h3", "", task.name);
    const hours = createElement(
        "p",
        "",
        `Estimated time: ${task.hours} hour${task.hours === 1 ? "" : "s"}`
    );

    info.append(title, hours);

    const actions = createElement("div", "task-actions");

    if (completed) {
        const restoreButton = createElement(
            "button",
            "btn btn-restore",
            "Restore"
        );

        restoreButton.type = "button";
        restoreButton.addEventListener("click", () => {
            updateTaskStatus(task.id, "Doing");
        });

        const deleteButton = createElement(
            "button",
            "btn btn-danger",
            "Delete"
        );

        deleteButton.type = "button";
        deleteButton.addEventListener("click", () => {
            deleteTask(task.id);
        });

        actions.append(restoreButton, deleteButton);
    } else {
        const statusSelect = document.createElement("select");
        statusSelect.className = "status-select";
        statusSelect.setAttribute(
            "aria-label",
            `Status for ${task.name}`
        );

        const statuses = ["Doing", "On Hold", "Completed"];

        statuses.forEach(status => {
            const option = document.createElement("option");
            option.value = status;
            option.textContent = status;
            option.selected = task.status === status;

            statusSelect.appendChild(option);
        });

        statusSelect.addEventListener("change", event => {
            updateTaskStatus(task.id, event.target.value);
        });

        const completeButton = createElement(
            "button",
            "btn btn-primary",
            "Finish"
        );

        completeButton.type = "button";
        completeButton.addEventListener("click", () => {
            updateTaskStatus(task.id, "Completed");
        });

        const deleteButton = createElement(
            "button",
            "btn btn-danger",
            "Remove"
        );

        deleteButton.type = "button";
        deleteButton.addEventListener("click", () => {
            deleteTask(task.id);
        });

        actions.append(statusSelect, completeButton, deleteButton);
    }

    card.append(info, actions);

    return card;
}


// Display all tasks and update statistics.
function renderTasks() {
    const activeTasks = tasks.filter(
        task => task.status !== "Completed"
    );

    const completedTasks = tasks.filter(
        task => task.status === "Completed"
    );

    // Clear existing task cards.
    activeTasksContainer.replaceChildren();
    completedListContainer.replaceChildren();

    // Render active tasks.
    if (activeTasks.length === 0) {
        activeTasksContainer.appendChild(
            createElement(
                "p",
                "empty-message",
                "No active tasks. Add one above!"
            )
        );
    } else {
        activeTasks.forEach(task => {
            activeTasksContainer.appendChild(
                createTaskCard(task)
            );
        });
    }

    // Render completed tasks.
    if (completedTasks.length === 0) {
        completedListContainer.appendChild(
            createElement(
                "p",
                "empty-message",
                "Completed tasks will appear here."
            )
        );
    } else {
        completedTasks.forEach(task => {
            completedListContainer.appendChild(
                createTaskCard(task, true)
            );
        });
    }

    // Update dashboard statistics.
    totalTasksElement.textContent = tasks.length;

    completedTasksElement.textContent = completedTasks.length;

    const hours = tasks.reduce(
        (sum, task) => sum + task.hours,
        0
    );

    totalHoursElement.textContent =
        Number(hours.toFixed(2)).toString();

    activeCountElement.textContent =
        `${activeTasks.length} ${activeTasks.length === 1 ? "task" : "tasks"}`;

    completedCountElement.textContent =
        `${completedTasks.length} ${completedTasks.length === 1 ? "task" : "tasks"}`;
}


// Add a new task.
taskForm.addEventListener("submit", event => {
    event.preventDefault();

    const name = taskNameInput.value.trim();
    const hours = Number(taskHoursInput.value);

    if (
        !name ||
        !Number.isFinite(hours) ||
        hours <= 0 ||
        hours > 1000
    ) {
        alert("Enter a valid task name and hours between 0.1 and 1000.");
        return;
    }

    const newTask = {
        id: crypto.randomUUID(),
        name: name,
        hours: hours,
        status: "Doing"
    };

    tasks.push(newTask);

    saveTasks();
    renderTasks();

    taskForm.reset();
    taskNameInput.focus();
});


// Change task status.
function updateTaskStatus(taskId, newStatus) {
    const task = tasks.find(task => task.id === taskId);

    if (!task) {
        return;
    }

    if (!["Doing", "On Hold", "Completed"].includes(newStatus)) {
        return;
    }

    task.status = newStatus;

    saveTasks();
    renderTasks();
}


// Permanently remove a task.
function deleteTask(taskId) {
    const confirmed = confirm(
        "Are you sure you want to permanently remove this task?"
    );

    if (!confirmed) {
        return;
    }

    tasks = tasks.filter(task => task.id !== taskId);

    saveTasks();
    renderTasks();
}


// Initial display.
renderTasks();