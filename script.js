class Todo {
    static term = '';

    // tworzenie nowego obiektu/taska za pomocą konstruktora
    constructor(text, date, done = false) {
        this.text = text;
        this.date = date;
        this.done = done;
    }

    // zmiana statusu ukończenia taska (checkbox)
    toggleDone() {
        this.done = !this.done;
    }

    // zmiana treści taska
    updateText(newText) {
        this.text = newText;
    }

    // zmiana daty taska
    updateDate(newDate) {
        this.date = newDate;
    }

    static getFilteredTasks(allTasks) {
        // pobieranie i usuwanie spacji z początku i końca inputu wyszukiwania
        const term = Todo.term.trim();

        // sprawdzanie, czy ma co najmniej 2 znaki i czy nie jest pusty
        if (!term || term.length < 2)
            return allTasks;

        // tworzenie escaped regex
        // aby znaki wpisane przez użytkownika nie zostały traktowane jako symbole wyrażeń regularnuch
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, 'i');

        // zwrócenie tylko pasujących tasków to-do listy
        return allTasks.filter(task => regex.test(task.text));
    }
}

const taskInput = document.getElementById('taskInput');
const taskDate = document.getElementById('taskDate');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const searchInput = document.getElementById('searchInput');

// wczytanie danych z localStorage
let tasks = JSON.parse(localStorage.getItem('tasks'));

// odtworzenie obiektów klasy todo po odczycie danych
tasks = tasks.map(t => new Todo(t.text, t.date, t.done));

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks(filter = '') {
    // czyszczenie listy zadań
    taskList.innerHTML = '';

    // pobieranie filtrowanej to-do listy
    Todo.getFilteredTasks(tasks).forEach((task, index) => {
        // utworzenie elementu li dla zadania
        const li = document.createElement('li');
        const taskLeft = document.createElement('div');
        taskLeft.className = 'task-left';

        // utworzenie checkboxa taska
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.done;
        checkbox.addEventListener('change', () => {
            task.toggleDone();
            saveTasks();
        });

        // wyświetlenie treści taska
        const span = document.createElement('span');
        span.innerHTML = highlightText(task.text, Todo.term);
        span.classList.toggle('completed', task.done);

        // edycja tytułu taska po podwójnym kliknięciu
        span.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            const input = document.createElement('input');
            input.type = 'text';
            input.value = task.text;
            span.replaceWith(input);
            input.focus();

            const saveEdit = () => {
                const newText = input.value.trim();

                if (newText.length >= 3 && newText.length <= 255) {
                    task.updateText(newText);
                    saveTasks();
                }
                renderTasks(searchInput.value);
            };

            // zapis po kliknięciu poza listę
            input.addEventListener('blur', saveEdit);
        });

        // wyświetlenie terminu taska
        const dateSpan = document.createElement('span');
        dateSpan.className = 'task-date';
        dateSpan.textContent = task.date || '';

        // edycja terminu taska po podwójnym kliknięciu
        dateSpan.addEventListener('dblclick', (e) => {
            e.stopPropagation();

            const input = document.createElement('input');
            input.type = 'date';
            input.value = task.date || '';
            dateSpan.replaceWith(input);
            input.focus();

            const saveDate = () => {
                const newDate = input.value;

                // sprawdzanie, czy wpisany termin jest w przyszłości
                if (newDate) {
                    const selected = new Date(newDate);
                    const now = new Date();
                    if (selected <= now) {
                        alert('Date must be in the future.');
                        renderTasks(searchInput.value);
                        return;
                    }
                }
                task.updateDate(newDate);
                saveTasks();
                renderTasks(searchInput.value);
            };

            // zapis po kliknięciu poza listę
            input.addEventListener('blur', saveDate);
        });

        // dodanie elementów do lewej sekcji taska
        // (checkbox, tytuł, data)
        taskLeft.appendChild(checkbox);
        taskLeft.appendChild(span);
        taskLeft.appendChild(dateSpan);

        // utworzenie linku/przycisku usuwającego zadanie
        const del = document.createElement('a');
        del.className = 'delete-link';
        del.textContent = 'Delete';
        del.href = '#';
        del.addEventListener('click', (e) => {
            e.preventDefault();
            // usunięcie taska z to-do listy
            tasks.splice(index, 1);
            saveTasks();
            renderTasks(searchInput.value);
        });

        // dodanie wszystkiego do elementu listy
        li.appendChild(taskLeft);
        li.appendChild(del);
        taskList.appendChild(li);
    });
}

function highlightText(text, filter) {
    // podświetlanie dopasowanego wyszukiwania w tytule taska
    if (!filter || filter.length < 2)
        return text;
    const escaped = filter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return text.replace(regex, `<span class="highlight">$1</span>`);
}

// dodawanie nowego taska po kliknięciu przycisku "save"
addTaskBtn.addEventListener('click', () => {
    const text = taskInput.value.trim();
    const dateValue = taskDate.value;

    // sprawdzenie długości tytułu taska
    if (text.length < 3 || text.length > 255) {
        alert('Task must be between 3 and 255 characters.');
        return;
    }

    // sprawdzenie czy termin taska jest w przyszłości
    if (dateValue) {
        const now = new Date();
        const selected = new Date(dateValue);
        if (selected <= now) {
            alert('Date must be in the future.');
            return;
        }
    }

    // dodanie zadania do to-do listy i jego zapis
    const newTask = new Todo(text, dateValue);
    tasks.push(newTask);
    saveTasks();
    renderTasks();

    // czyszczenie inputów
    taskInput.value = '';
    taskDate.value = '';
});

// aktualizowanie frazy (term) filtrowania przy wpisywaniu
searchInput.addEventListener('input', () => {
    Todo.term = searchInput.value.trim();
    renderTasks();
});

renderTasks();
