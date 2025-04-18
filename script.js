
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
import { getDatabase, ref, set, get, remove } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDnLamkbCtAqLYfFJfdIE2SNCv1T9pk2X0",
    authDomain: "ann-sharedtodoapp.firebaseapp.com",
    projectId: "ann-sharedtodoapp",
    storageBucket: "ann-sharedtodoapp.firebasestorage.app",
    messagingSenderId: "760666010000",
    appId: "1:760666010000:web:268ec83f0639296cdb8315",
    measurementId: "G-SEHX4H9D11"
};

const app = firebase.initializeApp(firebaseConfig);
const db  = firebase.database(app);
const analytics = firebase.analytics(app);

let tasks = []; //Array of task objects
const repeatCheckbox = document.getElementById('task-repeat');
const repeatSelect = document.getElementById('task-repeat-type');

function saveTaskToFirebase(task) {
    firebase.database().ref('tasks/' + task.id).set(task);
}

function removeTaskFromFirebase(taskId) {
    firebase.database().ref('tasks/' + taskId).remove();
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

            saveTaskToFirebase(repeatedTask);
        }
    });
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
                saveTaskToFirebase(task);
                renderTasks(); // refresh UI
            }
        });
    });

    document.querySelectorAll('.delete-task').forEach(button => {
        button.addEventListener('click', function () {
            const taskId = Number(this.getAttribute('data-id'));
            removeTaskFromFirebase(taskId);
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

let hasCheckedRepetition = false;

document.addEventListener('DOMContentLoaded', () => {
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

        filterForm.reset();
    });

    const resetBtn = document.getElementById('reset-filters');
    resetBtn.addEventListener('click', () => {
        filterForm.reset();   // clear all fields
        renderTasks();        // show all tasks again
    });

    // Realtime sync from Firebase (for Realtime Database)
    firebase.database().ref('tasks').on('value', (snapshot) => {
        tasks = [];
        snapshot.forEach(child => {
            tasks.push(child.val());
        });
    
        if (!hasCheckedRepetition) {
            handleRepetition();            // ✅ only run once
            hasCheckedRepetition = true;  // ✅ prevent further repeats
        }
    
        renderTasks();
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

    saveTaskToFirebase(newTask);
    
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