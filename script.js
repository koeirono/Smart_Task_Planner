document.addEventListener("DOMContentLoaded", () => {
  const taskForm = document.getElementById("taskForm");
  const taskName = document.getElementById("taskName");
  const taskPriority = document.getElementById("taskPriority");
  const taskDate = document.getElementById("taskDate");
  const taskList = document.getElementById("taskList");
  const searchBox = document.getElementById("searchBox");
  const filterStatus = document.getElementById("filterStatus");
  const progressBar = document.getElementById("progressBar");

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  function updateTaskStatistics() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.complete).length;
    const today = new Date().toISOString().split("T")[0];
    const overdue = tasks.filter(t => t.date && t.date < today && !t.complete).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    document.getElementById("totalTasks").textContent = total;
    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("overdueTasks").textContent = overdue;
    document.getElementById("completionPercent").textContent = percent + "%";
  }

  function updateProgress() {
    if (!progressBar) return;
    if (tasks.length === 0) {
      progressBar.style.width = "0%";
      progressBar.innerText = "0%";
      progressBar.setAttribute("aria-valuenow", 0);
      return;
    }
    const completed = tasks.filter(t => t.complete).length;
    const percent = Math.round((completed / tasks.length) * 100);

    progressBar.style.width = percent + "%";
    progressBar.innerText = percent + "%";
    progressBar.setAttribute("aria-valuenow", percent);
  }

  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
    updateProgress();
    if (typeof updatePriorityBreakdown === "function") updatePriorityBreakdown();
    updateTaskStatistics();
  }

  function renderTasks() {
    taskList.innerHTML = "";
    const searchTerm = searchBox.value.toLowerCase();
    const filter = filterStatus.value;

    tasks
      .filter(task => task.name.toLowerCase().includes(searchTerm))
      .filter(task => {
        if (filter === "complete") return task.complete;
        if (filter === "incomplete") return !task.complete;
        return true;
      })
      .forEach(task => {
        const li = document.createElement("li");
        li.className = `list-group-item d-flex justify-content-between align-items-center`;

        li.innerHTML = `
          <div>
            <input type="checkbox" ${task.complete ? "checked" : ""} class="me-2 toggle-task"/>
            <strong>${task.name}</strong>
            <span class="badge bg-${task.priority === "high" ? "danger" : task.priority === "medium" ? "warning" : "success"} ms-2">${task.priority}</span>
            <small class="text-muted ms-2">${task.date || ""}</small>
          </div>
          <div>
            <button class="btn btn-sm btn-info edit-task">Edit</button>
            <button class="btn btn-sm btn-danger delete-task">Delete</button>
          </div>
        `;

        li.querySelector(".toggle-task").addEventListener("change", () => {
          task.complete = !task.complete;
          saveTasks();
        });

        li.querySelector(".edit-task").addEventListener("click", () => {
          document.getElementById("taskId").value = task.id;
          taskName.value = task.name;
          taskPriority.value = task.priority;
          taskDate.value = task.date;
          new bootstrap.Modal(document.getElementById("taskModal")).show();
        });

        li.querySelector(".delete-task").addEventListener("click", () => {
          tasks = tasks.filter(t => t.id !== task.id);
          saveTasks();
        });

        taskList.appendChild(li);
      });
  }

  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("taskId").value;

    if (id) {
      const task = tasks.find(t => t.id == id);
      task.name = taskName.value;
      task.priority = taskPriority.value;
      task.date = taskDate.value;
    } else {
      tasks.push({
        id: Date.now(),
        name: taskName.value,
        priority: taskPriority.value,
        date: taskDate.value,
        complete: false
      });
    }

    saveTasks();
    taskForm.reset();
    bootstrap.Modal.getInstance(document.getElementById("taskModal")).hide();
  });

  const quotes = [
    "Small daily improvements over time lead to stunning results. – Robin Sharma",
    "Discipline is the bridge between goals and accomplishment. – Jim Rohn",
    "Success is the sum of small efforts, repeated day in and day out. – Robert Collier",
    "Motivation gets you started. Habit keeps you going. – Jim Ryun",
    "Don’t watch the clock; do what it does. Keep going. – Sam Levenson",
    "A little progress each day adds up to big results."
  ];

  function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quoteEl = document.getElementById("quote");
    if (quoteEl) quoteEl.textContent = quotes[randomIndex];
  }

  searchBox.addEventListener("input", renderTasks);
  filterStatus.addEventListener("change", renderTasks);

  showRandomQuote();
  renderTasks();
  updateTaskStatistics();
  updateProgress();
  if (typeof updatePriorityBreakdown === "function") updatePriorityBreakdown();
});