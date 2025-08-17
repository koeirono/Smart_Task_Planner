const taskForm = document.getElementById("taskForm");
const taskName = document.getElementById("taskName");
const taskPriority = document.getElementById("taskPriority");
const taskDate = document.getElementById("taskDate");
const taskList = document.getElementById("taskList");
const searchBox = document.getElementById("searchBox");
const filterStatus = document.getElementById("filterStatus");
const progressBar = document.getElementById("progressBar");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
  updateProgress();
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
    const newTask = {
      id: Date.now(),
      name: taskName.value,
      priority: taskPriority.value,
      date: taskDate.value,
      complete: false
    };
    tasks.push(newTask);
  }

  saveTasks();
  taskForm.reset();
  bootstrap.Modal.getInstance(document.getElementById("taskModal")).hide();
});

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
          <button class="btn btn-sm btn-info edit-task"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="btn btn-sm btn-danger delete-task"><i class="fa-solid fa-trash-can"></i></button>
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

function updateProgress() {
  if (tasks.length === 0) {
    progressBar.style.width = "0%";
    progressBar.innerText = "0%";
    return;
  }
  const completed = tasks.filter(t => t.complete).length;
  const percent = Math.round((completed / tasks.length) * 100);
  progressBar.style.width = percent + "%";
  progressBar.innerText = percent + "%";
}

searchBox.addEventListener("input", renderTasks);
filterStatus.addEventListener("change", renderTasks);

renderTasks();
updateProgress();