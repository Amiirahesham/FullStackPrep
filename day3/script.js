const idGenerator = (function() {
            let currentId = Date.now();
            return function() {
                return currentId++;
            };
        })();

        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        
        const taskForm = document.getElementById('task-form');
        const taskInput = document.getElementById('task-input');
        const taskList = document.getElementById('task-list');

        function saveTasks() {
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }

        const renderTasks = () => {
            taskList.innerHTML = '';
            
            tasks.forEach(task => {
                const li = document.createElement('li');
                li.setAttribute('data-id', task.id);
                
                if (task.completed) {
                    li.classList.add('completed');
                }

                li.innerHTML = `
                    <span class="task-text">${task.text}</span>
                    <div class="actions">
                        <button class="btn-toggle">Complete</button>
                        <button class="btn-delete">Delete</button>
                    </div>
                `;
                
                taskList.appendChild(li);
            });
        };

        taskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const text = taskInput.value.trim();
            if (text !== '') {
                tasks.push({
                    id: idGenerator(),
                    text: text,
                    completed: false
                });
                
                saveTasks();
                renderTasks();
                taskInput.value = '';
            }
        });

        taskList.addEventListener('click', (e) => {
            const clickedElement = e.target;
            
            if (clickedElement.tagName === 'BUTTON') {
                const li = clickedElement.closest('li');
                const taskId = Number(li.getAttribute('data-id'));

                if (clickedElement.classList.contains('btn-delete')) {
                    tasks = tasks.filter(task => task.id !== taskId);
                    saveTasks();
                    renderTasks();
                } else if (clickedElement.classList.contains('btn-toggle')) {
                    const task = tasks.find(task => task.id === taskId);
                    if (task) {
                        task.completed = !task.completed;
                        saveTasks();
                        renderTasks();
                    }
                }
            }
        });

        renderTasks();