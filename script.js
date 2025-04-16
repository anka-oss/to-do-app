let tasks = []; //Array of task objects

function saveTasksToLocalStorage() {
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
    const stored = localStorage.getItem('todoTasks');
    tasks = stored ? JSON.parse(stored) : [];
}

function handleRepetition() {
    const today = new Date().toISOString().split('T')[0];
    const newTasks = [];

    tasks.forEach(task => {
        if (task.repeat && Date(task.dueDate) < new Date(today)) {
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

            newTasks.puch(repeatedTask);
        }
    });

    if (newTasks.length > 0) {
        tasks = tasks.concat(newTasks);
        saveTasksToLocalStorage();    
    }
}

function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    tasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.classList.add('task-item');

        taskItem.innerHTML = `
            <div class="task header">
                <h3>${task.title}</h3>
                <button class="complete-btn" data-id="${task.id}">
            </div>
            <p><strong>Category:</strong> ${task.category}</p>
            <p><strong>Assigned to:</strong> ${task.assignedTo}</p>
            <p><strong>Due:</strong> ${task.dueDate}</p>
            <p><strong>Repeats:</strong> ${task.repeat ? 'Yes' : 'No'}</p>
            <p><strong>Status:</strong> ${task.completed ? 'Completed' : 'Not done'}</p>
        `;

        if (task.repeat) {
            const repeatTag = document.createElement('p');
            repeatTag.classList.add('repeat-tag');
            repeatTag.textContent = `🔁 ${task.repeat}`;
            taskItem.appendChild(repeatTag);
        }

        taskList.appendChild(taskItem);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadTasksFromLocalStorage();
    handleRepetition();
    renderTasks();
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
    document.getElementById('task-repeat-type').disable = !this.ariaChecked;
});

repeatCheckbox.addEventListener('change', () => {
    if (repeatCheckbox.checked) {
      repeatTypeSelect.disabled = false;
    } else {
      repeatTypeSelect.disabled = true;
      repeatTypeSelect.selectedIndex = 0;
    }
  });  

document.addEventListener('DOMContentLoaded', () => {
    const repeatCheckbox = document.getElementById('task-repeat');
    const repeatTypeSelect = document.getElementById('task-repeat-type');
  
    repeatCheckbox.addEventListener('change', () => {
      repeatTypeSelect.disabled = !repeatCheckbox.checked;
    });
});
