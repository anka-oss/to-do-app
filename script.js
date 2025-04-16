let tasks = []; //Array of task objects

function saveTasksToLocalStorage() {
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
    conststored = localStorage.getItem('todoTasks');
    tasks = stored ? JSON.parse(stored) : [];
}

function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    tasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.classList.add('task-item');

        taskItem.innerHTML = `
            <h3>${task.title}</h3>
            <p><strong>Category:</strong> ${task.category}</p>
            <p><strong>Assigned to:</strong> ${task.assigned.To}</p>
            <p><strong>Due:</strong> ${task.dueDate}</p>
            <p><strong>Repeats:</strong> ${task.repeat ? 'Yes' : 'No'}</p>
            <p><strong>Status:</strong> ${task.completed ? 'Completed' : 'Not done'}</p>
        `;

        taskList.appendChiled(taskItem);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadTasksFromLocalStorage();
    renderTasks();
})