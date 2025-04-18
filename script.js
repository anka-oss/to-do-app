let tasks = []; //Array of task objects
const repeatCheckbox = document.getElementById('task-repeat');
const repeatSelect = document.getElementById('task-repeat-type');

function saveTasksToLocalStorage() {
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
    const stored = localStorage.getItem('todoTasks');
    tasks = stored ? JSON.parse(stored) : [];
}

function removeTasksFromLocalStorage(taskId) {
    const stored = localStorage.getItem('todoTasks');
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    tasks = updatedTasks;
    saveTasksToLocalStorage();
}

function handleRepetition() {
    const today = new Date().toISOString().split('T')[0];
    const newTasks = [];

    tasks.forEach(task => {
        if (task.repeat && new Date(task.dueDate) < new Date(today)) {
            let nextDate = new Date(task.dueDate);

            switch (task.repeat) {
                case 'daily':
                    nextDate.setDate(nextDate.getDate() + 1);
                    break;
                case 'second':
                    nextDate.setDate(nextDate.getDate() + 2);
                    break;
                case 'weekly':
                    nextDate.setDate(nextDate.getDate() + 7);
                    break;
                case 'monthly':
                    nextDate.setMonth(nextDate.getMonth() + 1);
                    break;
            }

            const repeatedTask = {
                ...task,
                id: Date.now() + Math.random(),
                dueDate: nextDate.toISOString().split('T')[0],
                completed: false
            };

            newTasks.push(repeatedTask);
        }
    });

    if (newTasks.length > 0) {
        tasks = tasks.concat(newTasks);
        saveTasksToLocalStorage();    
    }
}

function applyFilters(personFilter, categoryFilter, dateFilter) {
    let filteredTasks = tasks.filter(task => {
        // Apply person and category filters
        const matchesPerson = personFilter === "all" || task.assignedTo === personFilter;
        const matchesCategory = categoryFilter === "all" || task.category === categoryFilter;
        return matchesPerson && matchesCategory;
    });

    // Apply date sorting
    if (dateFilter === "newest") {
        filteredTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    } else if (dateFilter === "oldest") {
        filteredTasks.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
    }

    renderTasks(filteredTasks); // Show only the filtered & sorted tasks
}

function applyTodayOnlyFilter() {
    const today = new Date().toISOString().split('T')[0];
    const todaysTask = tasks.filter(task => task.dueDate === today);
    renderTasks(todaysTask);
}


function attachEventListeners() {
    document.querySelectorAll('.complete-checkbox').forEach(button => {
        button.addEventListener('change', function () {
            const taskId = Number(this.getAttribute('data-id'));
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                task.completed = !task.completed;
                saveTasksToLocalStorage();
                renderTasks(); // refresh UI
            }
        });
    });

    document.querySelectorAll('.delete-task').forEach(button => {
        button.addEventListener('click', function () {
            const taskId = Number(this.getAttribute('data-id'));
            removeTasksFromLocalStorage(taskId);
            renderTasks();
        });
    });
}


function renderTasks(tasksToRender = tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    tasksToRender.forEach(task => {
        const taskItem = document.createElement('div');
        if (task.completed) taskItem.classList.add('completed-task');
        taskItem.classList.add('task-item');

        taskItem.innerHTML = `
            <div class="task header">
                <h3>${task.title}</h3>
                <label>
                    <input type="checkbox" class="complete-checkbox" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
                    Completed
                </label>
            </div>
            <p><strong>Category:</strong> ${task.category}</p>
            <p><strong>Assigned to:</strong> ${task.assignedTo}</p>
            <p><strong>Due:</strong> ${task.dueDate}</p>
            <p><strong>Repeats:</strong> ${task.repeat ? 'Yes' : 'No'}</p>
            <p><strong>Status:</strong> ${task.completed ? 'Completed' : 'Not done'}</p>
            <button type="button" class="delete-task" data-id="${task.id}">Delete</button>
        `;

        if (task.repeat) {
            const repeatTag = document.createElement('p');
            repeatTag.classList.add('repeat-tag');
            repeatTag.textContent = `🔁 ${task.repeat}`;
            taskItem.appendChild(repeatTag);
        }

        taskList.appendChild(taskItem);
    });

    attachEventListeners();
}

document.addEventListener('DOMContentLoaded', () => {
    loadTasksFromLocalStorage();
    renderTasks();
    handleRepetition();

  
    repeatCheckbox.addEventListener('change', () => {
      repeatSelect.disabled = !repeatCheckbox.checked;
    });

    const filterForm = document.getElementById('filter-form');

    
    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
    
        const filterPerson = document.getElementById('filter-person');
        const filterCategory = document.getElementById('filter-category');
        const filterDate = document.getElementById('filter-date');
    
        const personFilter = filterPerson.value;
        const categoryFilter = filterCategory.value;
        const dateFilter = filterDate.value;
    
        applyFilters(personFilter, categoryFilter, dateFilter);
    });

});

document.getElementById('task-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const title = document.getElementById('task-title').value;
    const category = document.getElementById('task-category').value;
    const assignedTo = document.getElementById('task-person').value;
    const dueDate = document.getElementById('task-date').value;
    const repeatEnabled = document.getElementById('task-repeat').checked;
    const repeatType = repeatEnabled ? document.getElementById('task-repeat-type').value : "";

    const newTask = {
        id: Date.now(),
        title,
        dueDate,
        assignedTo,
        category,
        repeat: repeatType,
        completed: false
    };

    tasks.push(newTask);

    saveTasksToLocalStorage();
    renderTasks();
    
    e.target.reset();
});

document.getElementById('task-repeat').addEventListener('change', function() {
    document.getElementById('task-repeat-type').disabled = !this.checked;
});

document.getElementById('today-only').addEventListener('change', function () {
    if (this.checked) {
        applyTodayOnlyFilter();
    } else {
        renderTasks(); // show all tasks again
    }
});

