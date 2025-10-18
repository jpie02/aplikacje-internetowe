const taskInput = document.getElementById('taskInput');
const taskDate = document.getElementById('taskDate');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const searchInput = document.getElementById('searchInput');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Render the list
function renderTasks(filter = '') {
    taskList.innerHTML = '';
    tasks
        .filter(task => task.text.toLowerCase().includes(filter.toLowerCase()))
        .forEach((task, index) => {
            const li = document.createElement('li');

            const taskLeft = document.createElement('div');
            taskLeft.className = 'task-left';

            // Checkbox
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.done;
            checkbox.addEventListener('change', () => {
                task.done = checkbox.checked;
                saveTasks();
            });

            // Task text
            const span = document.createElement('span');
            span.innerHTML = highlightText(task.text, filter);
            span.classList.toggle('completed', task.done);

            // Inline editing
            span.addEventListener('click', (e) => {
                e.stopPropagation();
                const input = document.createElement('input');
                input.type = 'text';
                input.value = task.text;
                span.replaceWith(input);
                input.focus();

                const saveEdit = () => {
                    const newText = input.value.trim();
                    if (newText.length >= 3 && newText.length <= 255) {
                        task.text = newText;
                        saveTasks();
                    }
                    renderTasks(searchInput.value);
                };

                input.addEventListener('blur', saveEdit);
                input.addEventListener('keydown', (ev) => {
                    if (ev.key === 'Enter') saveEdit();
                });
            });

            // Date
            const dateSpan = document.createElement('span');
            dateSpan.className = 'task-date';
            dateSpan.textContent = task.date || '';

            taskLeft.appendChild(checkbox);
            taskLeft.appendChild(span);
            taskLeft.appendChild(dateSpan);

            // Delete
            const del = document.createElement('a');
            del.className = 'delete-link';
            del.textContent = 'Delete';
            del.href = '#';
            del.addEventListener('click', (e) => {
                e.preventDefault();
                tasks.splice(index, 1);
                saveTasks();
                renderTasks(searchInput.value);
            });

            li.appendChild(taskLeft);
            li.appendChild(del);
            taskList.appendChild(li);
        });
}

// Highlight matching search text
function highlightText(text, filter) {
    if (!filter || filter.length < 2) return text;
    const regex = new RegExp(`(${filter})`, 'gi');
    return text.replace(regex, `<span class="highlight">$1</span>`);
}

// Add new task
addTaskBtn.addEventListener('click', () => {
    const text = taskInput.value.trim();
    const dateValue = taskDate.value;

    if (text.length < 3 || text.length > 255) {
        alert('Task must be between 3 and 255 characters.');
        return;
    }

    if (dateValue) {
        const now = new Date();
        const selected = new Date(dateValue);
        if (selected <= now) {
            alert('Date must be in the future.');
            return;
        }
    }

    tasks.push({ text, date: dateValue, done: false });
    saveTasks();
    renderTasks();
    taskInput.value = '';
    taskDate.value = '';
});

// Search functionality
searchInput.addEventListener('input', () => {
    const value = searchInput.value.trim();
    if (value.length >= 2 || value.length === 0) {
        renderTasks(value);
    }
});

// Initial render
renderTasks();