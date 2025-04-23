// Selecionando elementos DOM
const taskInput = document.getElementById('task-input');
const taskDescription = document.getElementById('task-description');
const difficultySelect = document.getElementById('difficulty-select');
const addButton = document.getElementById('add-button');
const taskList = document.getElementById('task-list');
const tasksCounter = document.getElementById('tasks-counter');
const clearCompletedBtn = document.getElementById('clear-completed');
const filters = document.querySelectorAll('.filter');
const difficultyFilters = document.querySelectorAll('.difficulty-filter');

// Array para armazenar tarefas
let tasks = [];

// Variáveis para controlar filtros ativos
let activeStatusFilter = 'all';
let activeDifficultyFilter = 'all';

// Carregando tarefas do localStorage quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    renderTasks();
    updateTasksCounter();
});

// Adicionar nova tarefa quando o botão é clicado
addButton.addEventListener('click', addTask);

// Adicionar tarefa quando Enter é pressionado no input
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Event listener para limpar tarefas concluídas
clearCompletedBtn.addEventListener('click', clearCompleted);

// Event listeners para os filtros de status
filters.forEach(filter => {
    filter.addEventListener('click', () => {
        // Remover a classe 'active' de todos os filtros
        filters.forEach(f => f.classList.remove('active'));
        // Adicionar a classe 'active' ao filtro clicado
        filter.classList.add('active');
        // Atualizar filtro ativo
        activeStatusFilter = filter.getAttribute('data-filter');
        // Aplicar o filtro
        renderTasks();
    });
});

// Event listeners para os filtros de dificuldade
difficultyFilters.forEach(filter => {
    filter.addEventListener('click', () => {
        // Remover a classe 'active' de todos os filtros de dificuldade
        difficultyFilters.forEach(f => f.classList.remove('active'));
        // Adicionar a classe 'active' ao filtro clicado
        filter.classList.add('active');
        // Atualizar filtro de dificuldade ativo
        activeDifficultyFilter = filter.getAttribute('data-difficulty');
        // Aplicar o filtro
        renderTasks();
    });
});

// Função para adicionar uma nova tarefa
function addTask() {
    const taskText = taskInput.value.trim();
    const description = taskDescription.value.trim();
    
    if (taskText === '') return;
    
    const newTask = {
        id: Date.now(),
        text: taskText,
        description: description,
        difficulty: difficultySelect.value,
        completed: false
    };
    
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    updateTasksCounter();
    
    // Limpar os campos
    taskInput.value = '';
    taskDescription.value = '';
    taskInput.focus();
}

// Função para criar elemento de tarefa
function createTaskElement(task) {
    const taskItem = document.createElement('li');
    taskItem.classList.add('task-item', 'card', 'mb-3');
    if (task.completed) {
        taskItem.classList.add('completed');
    }
    taskItem.setAttribute('data-id', task.id);
    
    const taskContent = document.createElement('div');
    taskContent.classList.add('card-body');
    
    const taskHeader = document.createElement('div');
    taskHeader.classList.add('task-header');
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add('task-checkbox', 'form-check-input');
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTaskStatus(task.id));
    
    const contentWrapper = document.createElement('div');
    contentWrapper.classList.add('task-content-wrapper');
    
    const taskText = document.createElement('h5');
    taskText.classList.add('task-text', 'card-title', 'mb-0');
    taskText.textContent = task.text;
    
    const taskDifficulty = document.createElement('span');
    taskDifficulty.classList.add('task-difficulty', 'badge');
    
    let difficultyText = '';
    switch(task.difficulty) {
        case 'facil':
            difficultyText = 'Fácil';
            taskDifficulty.classList.add('bg-success');
            break;
        case 'medio':
            difficultyText = 'Médio';
            taskDifficulty.classList.add('bg-warning');
            break;
        case 'dificil':
            difficultyText = 'Difícil';
            taskDifficulty.classList.add('bg-danger');
            break;
        default:
            difficultyText = 'Fácil';
            taskDifficulty.classList.add('bg-success');
    }
    
    taskDifficulty.textContent = difficultyText;
    
    const actionButtons = document.createElement('div');
    actionButtons.classList.add('task-actions');
    
    const editButton = document.createElement('button');
    editButton.classList.add('btn', 'btn-sm', 'btn-outline-primary');
    editButton.innerHTML = '<i class="fas fa-edit"></i>';
    editButton.addEventListener('click', () => startEditing(task.id));
    
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('btn', 'btn-sm', 'btn-outline-danger');
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    
    actionButtons.appendChild(editButton);
    actionButtons.appendChild(deleteBtn);
    
    contentWrapper.appendChild(taskText);
    contentWrapper.appendChild(taskDifficulty);
    
    taskHeader.appendChild(checkbox);
    taskHeader.appendChild(contentWrapper);
    taskHeader.appendChild(actionButtons);
    
    taskContent.appendChild(taskHeader);
    
    if (task.description) {
        const taskDescription = document.createElement('p');
        taskDescription.classList.add('task-description', 'card-text', 'text-muted', 'mt-2', 'mb-0', 'collapse');
        taskDescription.textContent = task.description;
        taskDescription.id = `description-${task.id}`;
        
        const expandButton = document.createElement('button');
        expandButton.classList.add('btn', 'btn-link', 'btn-sm', 'p-0', 'mt-2');
        expandButton.setAttribute('data-bs-toggle', 'collapse');
        expandButton.setAttribute('data-bs-target', `#description-${task.id}`);
        expandButton.innerHTML = '<i class="fas fa-chevron-down me-1"></i>Ver descrição';
        
        taskContent.appendChild(taskDescription);
        taskContent.appendChild(expandButton);
    }
    
    taskItem.appendChild(taskContent);
    
    return taskItem;
}

// Função para renderizar tarefas baseada nos filtros atuais
function renderTasks() {
    // Limpar a lista de tarefas
    taskList.innerHTML = '';
    
    // Aplicar ambos os filtros
    let filteredTasks = tasks;
    
    // Filtrar por status
    if (activeStatusFilter === 'active') {
        filteredTasks = filteredTasks.filter(task => !task.completed);
    } else if (activeStatusFilter === 'completed') {
        filteredTasks = filteredTasks.filter(task => task.completed);
    }
    
    // Filtrar por dificuldade
    if (activeDifficultyFilter !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.difficulty === activeDifficultyFilter);
    }
    
    // Renderizar tarefas filtradas
    filteredTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        taskList.appendChild(taskElement);
    });
}

// Alternar status de conclusão da tarefa
function toggleTaskStatus(taskId) {
    tasks = tasks.map(task => {
        if (task.id === taskId) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    
    saveTasks();
    renderTasks();
    updateTasksCounter();
}

// Função para deletar uma tarefa
function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks();
    renderTasks();
    updateTasksCounter();
}

// Função para limpar tarefas concluídas
function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
    updateTasksCounter();
}

// Função para atualizar o contador de tarefas
function updateTasksCounter() {
    const activeTasks = tasks.filter(task => !task.completed).length;
    tasksCounter.textContent = `${activeTasks} ${activeTasks === 1 ? 'tarefa restante' : 'tarefas restantes'}`;
}

// Funções para salvar e carregar tarefas do localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
}

function startEditing(taskId) {
    const taskItem = document.querySelector(`li[data-id="${taskId}"]`);
    const task = tasks.find(t => t.id === taskId);
    const taskContent = taskItem.querySelector('.card-body');
    
    const editForm = document.createElement('div');
    editForm.classList.add('task-edit-form');
    
    editForm.innerHTML = `
        <div class="mb-3">
            <label class="form-label">Título da Tarefa</label>
            <input type="text" class="form-control" value="${task.text}">
        </div>
        <div class="mb-3">
            <label class="form-label">Descrição</label>
            <textarea class="form-control" rows="2">${task.description || ''}</textarea>
        </div>
        <div class="mb-3">
            <label class="form-label">Dificuldade</label>
            <select class="form-select">
                <option value="facil" ${task.difficulty === 'facil' ? 'selected' : ''}>Fácil</option>
                <option value="medio" ${task.difficulty === 'medio' ? 'selected' : ''}>Médio</option>
                <option value="dificil" ${task.difficulty === 'dificil' ? 'selected' : ''}>Difícil</option>
            </select>
        </div>
        <div class="d-flex gap-2">
            <button class="btn btn-success save-edit">Salvar</button>
            <button class="btn btn-secondary cancel-edit">Cancelar</button>
        </div>
    `;
    
    const saveButton = editForm.querySelector('.save-edit');
    const cancelButton = editForm.querySelector('.cancel-edit');
    const editInput = editForm.querySelector('input');
    const editDescription = editForm.querySelector('textarea');
    const editDifficulty = editForm.querySelector('select');
    
    saveButton.addEventListener('click', () => 
        saveEdit(taskId, editInput.value, editDescription.value, editDifficulty.value)
    );
    
    cancelButton.addEventListener('click', () => cancelEdit(taskId));
    
    taskContent.style.display = 'none';
    taskItem.appendChild(editForm);
}

function saveEdit(taskId, newText, newDescription, newDifficulty) {
    tasks = tasks.map(task => {
        if (task.id === taskId) {
            return {
                ...task,
                text: newText.trim(),
                description: newDescription.trim(),
                difficulty: newDifficulty
            };
        }
        return task;
    });
    
    saveTasks();
    renderTasks();
}

function cancelEdit(taskId) {
    renderTasks();
} 