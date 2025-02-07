document.addEventListener('DOMContentLoaded', function () {
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const themeToggle = document.getElementById('theme-toggle');
    const toggleSidebar = document.getElementById('toggle-sidebar');
    const sidebar = document.getElementById('sidebar');
    const recycleBin = document.getElementById('recycle-bin');
    const micButton = document.getElementById('mic-button');
    const recognizedText = document.getElementById('recognized-text');
    let isDarkMode = false;

    // Retrieve existing tasks and deleted tasks from localStorage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let deletedTasks = JSON.parse(localStorage.getItem('deletedTasks')) || [];

    // Render tasks on page load
    renderTasks();
    renderRecycleBin();

    // Event listeners
    addTaskBtn.addEventListener('click', addTask);
    themeToggle.addEventListener('click', toggleTheme);
    toggleSidebar.addEventListener('click', toggleSidebarMenu);
    micButton.addEventListener('click', startVoiceRecognition);

    // Function to add a new task
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === '') return; // Don't add empty tasks

        tasks.push(taskText);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        taskInput.value = ''; // Clear input after adding
        renderTasks();
    }

    // Function to render tasks
    function renderTasks() {
        taskList.innerHTML = '';  // Clear the existing list of tasks
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = 'task-item';
            li.innerHTML = `
                <span class="task-text">${task}</span>
                <button class="edit-btn" onclick="editTask(${index})">✏</button>
                <button class="delete-btn" onclick="deleteTask(${index})">🗑</button>
            `;
            taskList.appendChild(li);
        });
    }

    window.deleteTask = function (index) {
        const deletedTask = tasks.splice(index, 1)[0]; // Remove and return the deleted task
        deletedTasks.push(deletedTask); // Add it to deletedTasks array
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('deletedTasks', JSON.stringify(deletedTasks));
        renderTasks();
        renderRecycleBin(); // Update recycle bin view
    };

    // Function to render the recycle bin
    function renderRecycleBin() {
        recycleBin.innerHTML = '';
        deletedTasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="task-text">${task}</span>
                <button class="restore-btn" onclick="restoreTask(${index})">Restore</button>
                <button class="permanently-delete-btn" onclick="permanentlyDeleteTask(${index})">Delete Permanently</button>
            `;
            recycleBin.appendChild(li);
        });
    }

    // Function to restore a task from recycle bin
    window.restoreTask = function (index) {
        const restoredTask = deletedTasks.splice(index, 1)[0]; // Remove from deletedTasks and get the task
        tasks.push(restoredTask); // Add it back to tasks
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('deletedTasks', JSON.stringify(deletedTasks));
        renderTasks();
        renderRecycleBin(); // Update recycle bin view
    };

    // Function to delete a task permanently
    window.permanentlyDeleteTask = function (index) {
        deletedTasks.splice(index, 1); // Remove from deletedTasks
        localStorage.setItem('deletedTasks', JSON.stringify(deletedTasks));
        renderRecycleBin(); // Update recycle bin view
    };

    // Function to edit a task
    window.editTask = function (index) {
        const newText = prompt('Edit your task:', tasks[index]);
        if (newText !== null && newText.trim() !== '') {
            tasks[index] = newText.trim(); // Update task text
            localStorage.setItem('tasks', JSON.stringify(tasks));
            renderTasks();
        }
    };

    // Function to toggle theme
    function toggleTheme() {
        isDarkMode = !isDarkMode;
        document.body.classList.toggle('dark-mode', isDarkMode);
        document.querySelector('.app-container').classList.toggle('dark-mode', isDarkMode);
        themeToggle.textContent = isDarkMode ? '☀' : '🌙';
        console.log('Theme icon:', themeToggle.textContent);  
    }

    // Function to toggle the sidebar
    function toggleSidebarMenu() {
        sidebar.classList.toggle('open');
    }

    // Voice recognition functionality
    function startVoiceRecognition() {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new webkitSpeechRecognition();
            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.start();

            recognition.onresult = function (event) {
                const speechResult = event.results[0][0].transcript.trim();
                recognizedText.textContent = `You said: ${speechResult}`;
                performAction(speechResult);
            };

            recognition.onerror = function (event) {
                console.error('Error occurred in recognition: ', event.error);
                recognizedText.textContent = 'Error occurred. Try again.';
            };
        } else {
            alert("Your browser does not support the Web Speech API.");
        }
    }

    // Perform an action based on the recognized command
    function performAction(command) {
        if (command.includes('add task')) {
            const task = command.replace('add task', '').trim();
            if (task) {
                tasks.push(task);
                localStorage.setItem('tasks', JSON.stringify(tasks));
                renderTasks();
            }
        } else if (command.includes('delete task')) {
            const index = parseInt(command.match(/\d+/));
            if (!isNaN(index)) {
                deleteTask(index);
            }
        }
    }

    // Define calendarInput globally so it's accessible
    const calendarInput = document.getElementById('calendar-input');

    // Initialize Flatpickr for the calendar input
    flatpickr(calendarInput, {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        onClose: function(selectedDates, dateStr, instance) {
            // Custom behavior on close
            instance.close();
        }
    });

    // Handle task submission
    document.getElementById('task-form').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission
        const taskInput = document.getElementById('task-input');
        const taskValue = taskInput.value.trim();
        
        if (taskValue) {
            // Add task to the task list
            const taskList = document.getElementById('task-list');
            const listItem = document.createElement('li');
            listItem.textContent = taskValue;
            taskList.appendChild(listItem);
            taskInput.value = ''; // Clear the input after adding the task
        }
    });

    const badgeData = [
        { id: "first_task", name: "First Task", description: "Complete your first task!" },
        { id: "streak_7", name: "Streak Star", description: "Complete tasks 7 days in a row!" },
        { id: "night_owl", name: "Night Owl", description: "Complete a task late at night!" }
    ];

    function completeTask() {
        const tasksCompleted = parseInt(localStorage.getItem("tasksCompleted") || "0") + 1;
        localStorage.setItem("tasksCompleted", tasksCompleted);

        // Check for badges
        checkFirstTaskBadge(tasksCompleted);
        checkNightOwlBadge();
        checkStreakBadge();
    }

    function checkFirstTaskBadge(tasksCompleted) {
        if (tasksCompleted === 1 && !localStorage.getItem("first_task_awarded")) {
            awardBadge("first_task");
        }
    }

    function checkNightOwlBadge() {
        const currentHour = new Date().getHours();
        if ((currentHour >= 22 || currentHour <= 2) && !localStorage.getItem("night_owl_awarded")) {
            awardBadge("night_owl");
        }
    }

    function checkStreakBadge() {
        const lastCompletedDate = localStorage.getItem("lastTaskDate");
        const today = new Date().toDateString();
        if (lastCompletedDate === today) return;  // Prevent multiple completions in a day

        let streak = parseInt(localStorage.getItem("streak") || "0");
        if (lastCompletedDate && new Date(lastCompletedDate).getTime() + 86400000 === new Date().getTime()) {
            streak++;
        } else {
            streak = 1;  // Reset if a day was missed
        }
        localStorage.setItem("streak", streak);
        localStorage.setItem("lastTaskDate", today);

        if (streak === 7 && !localStorage.getItem("streak_7_awarded")) {
            awardBadge("streak_7");
        }
    }

    function awardBadge(badgeId) {
        const badge = badgeData.find(b => b.id === badgeId);
        if (badge) {
            localStorage.setItem(`${badgeId}_awarded`, true);  // Store the award status
            displayBadgeNotification(badge.name);
        }
    }

    function loadBadges() {
        const badgesContainer = document.getElementById("badges");
        badgesContainer.innerHTML = "";  // Clear previous badges

        badgeData.forEach(badge => {  // Use badgeData instead of badges
            if (localStorage.getItem(`${badge.id}_awarded`)) {  // Check if badge is awarded
                const badgeElement = document.createElement("div");
                badgeElement.classList.add("badge");
                badgeElement.innerHTML = `<strong>${badge.name}</strong><br>${badge.description}`;
                badgesContainer.appendChild(badgeElement);
            }
        });
    }

    function displayBadgeNotification(badgeName) {
        const notification = document.createElement("div");
        notification.classList.add("badge-notification");
        notification.innerHTML = `🎉 You've earned the '${badgeName}' badge!`;

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 8000); // Remove after 8 seconds
    }

    // Call this to load badges on page load
    document.addEventListener("DOMContentLoaded", loadBadges);

    // Save and retrieve badge data with encoding (optional for persistence across sessions)
    const encode = str => btoa(unescape(encodeURIComponent(str)));  // Ensuring UTF-8 compatibility
    const decode = str => decodeURIComponent(escape(atob(str)));   // Ensuring UTF-8 compatibility

    // Optionally, save badgeData in encoded form
    localStorage.setItem('badgeData', encode(JSON.stringify(badgeData)));  // Encoding the badgeData
});
