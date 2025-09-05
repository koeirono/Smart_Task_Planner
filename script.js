document.addEventListener("DOMContentLoaded", () => {
  const taskForm = document.getElementById("taskForm");
  const taskName = document.getElementById("taskName");
  const taskPriority = document.getElementById("taskPriority");
  const taskDate = document.getElementById("taskDate");
  const taskList = document.getElementById("taskList");
  const searchBox = document.getElementById("searchBox");
  const filterStatus = document.getElementById("filterStatus");
  const progressBar = document.getElementById("progressBar");
  const resetTasksBtn = document.getElementById("resetTasksBtn");
  const categoryTabs = document.querySelectorAll("#categoryTabs .nav-link");
  const priorityTabs = document.querySelectorAll("#priorityTabs .nav-link");
  const filterDate = document.getElementById("filterDate");

  if (filterDate) {
    filterDate.addEventListener("change", renderTasks);
  }

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let activeCategory = "all";
  let activePriority = null;

  categoryTabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      categoryTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      activeCategory = tab.getAttribute("data-category");
      activePriority = null; 
      priorityTabs.forEach((t) => t.classList.remove("active"));
      renderTasks();
    });
  });

  priorityTabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      priorityTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      activePriority = tab.getAttribute("data-priority");
      activeCategory = "all"; 
      categoryTabs.forEach((t) => t.classList.remove("active"));
      document.querySelector('[data-category="all"]').classList.add("active"); 
      renderTasks();
    });
  });

  function getWittyLabel(percent) {
    if (percent === 0) return "Get started";
    if (percent <= 40) return "Just getting started…";
    if (percent <= 49) return "Warming up! ";
    if (percent <= 50) return "Halfway done ";
    if (percent <= 70) return "Making progress ";
    if (percent <= 90) return "Almost there ";
    if (percent < 100) return "So close! ";
    return "All done! ";
  }

  function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.complete).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    if (progressBar) {
      progressBar.style.width = percent + "%";
    }

    const labelEl = document.getElementById("progressLabel");
    if (labelEl) {
      labelEl.textContent = `${getWittyLabel(percent)} - ${percent}%`;
    }
  }

  function updateTaskStatistics() {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.complete).length;
    const today = new Date().toISOString().split("T")[0];
    const overdue = tasks.filter(
      (t) => t.date && t.date < today && !t.complete
    ).length;

    if (window.taskChart) {
      const incomplete = Math.max(0, total - completed - overdue);
      window.taskChart.data.datasets[0].data = [completed, incomplete, overdue];
      window.taskChart.update();
    }
  }

  function renderTasks() {
    taskList.innerHTML = "";

    const searchTerm = searchBox.value.toLowerCase();
    const filter = filterStatus.value;
    const dateFilter = filterDate?.value || "";
    const today = new Date().toISOString().split("T")[0];

    tasks
      .filter((task) => task.name.toLowerCase().includes(searchTerm))
      .filter((task) => {
        if (filter === "complete") return task.complete;
        if (filter === "incomplete") return !task.complete;
        return true;
      })
      .filter((task) => {
        if (
          activeCategory !== "all" &&
          (task.category || "").toLowerCase() !== activeCategory.toLowerCase()
        )
          return false;
        if (
          activePriority &&
          (task.priority || "").toLowerCase() !== activePriority.toLowerCase()
        )
          return false;
        if (dateFilter) return task.date && task.date === dateFilter;
        return true;
      })
      .forEach((task) => {
        const li = document.createElement("li");
        li.className =
          "list-group-item d-flex justify-content-between align-items-center";

        const isOverdue = task.date && task.date < today && !task.complete;
        const overdueBadge = isOverdue
          ? `<span class="badge badge-purple ms-2">Overdue</span>`
          : "";

        li.innerHTML = `
          <div>
            <input type="checkbox" ${
              task.complete ? "checked" : ""
            } class="me-2 toggle-task"/>
            <strong>${task.name}</strong>
            <span class="badge bg-${
              task.priority === "high"
                ? "danger"
                : task.priority === "medium"
                ? "warning text-dark"
                : "success"
            } ms-2">${task.priority}</span>
            <span class="badge bg-purple ms-2">${
              task.category || "Uncategorized"
            }</span>
            <small class="text-muted ms-2">${task.date || ""}</small>
            ${overdueBadge}
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
          document.getElementById("taskCategory").value = task.category || "";
          new bootstrap.Modal(document.getElementById("taskModal")).show();
        });

        li.querySelector(".delete-task").addEventListener("click", () => {
          if (confirm(`Are you sure you want to delete "${task.name}"?`)) {
            tasks = tasks.filter((t) => t.id !== task.id);
            saveTasks();
          }
        });

        taskList.appendChild(li);
      });

    updateProgress();
    updateTaskStatistics();
  }

  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("taskId").value;

    if (id) {
      const task = tasks.find((t) => t.id == id);
      task.name = taskName.value;
      task.priority = taskPriority.value;
      task.date = taskDate.value;
      task.category = document.getElementById("taskCategory").value;
    } else {
      tasks.push({
        id: Date.now(),
        name: taskName.value,
        priority: taskPriority.value,
        date: taskDate.value,
        category: document.getElementById("taskCategory").value,
        complete: false,
      });
    }

    saveTasks();
    taskForm.reset();
    bootstrap.Modal.getInstance(document.getElementById("taskModal")).hide();
  });

  resetTasksBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all tasks?")) {
      tasks = [];
      localStorage.removeItem("tasks");
      renderTasks();
      updateProgress();
      updateTaskStatistics();
    }
  });

  const quotes = [
    "Small daily improvements over time lead to stunning results. – Robin Sharma",
    "Discipline is the bridge between goals and accomplishment. – Jim Rohn",
    "Success is the sum of small efforts, repeated day in and day out. – Robert Collier",
    "Motivation gets you started. Habit keeps you going. – Jim Ryun",
    "Don’t watch the clock; do what it does. Keep going. – Sam Levenson",
    "A little progress each day adds up to big results.",
  ];

  function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quoteEl = document.getElementById("quote");
    if (quoteEl) quoteEl.textContent = quotes[randomIndex];
  }

  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
    updateTaskStatistics();
    updateProgress();
  }

  searchBox.addEventListener("input", renderTasks);
  filterStatus.addEventListener("change", renderTasks);

  showRandomQuote();
  renderTasks();
  updateTaskStatistics();
  updateProgress();
});