// Selecionando elementos DOM
const taskInput = document.getElementById('task-input');
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
    
    if (taskText === '') return;
    
    const newTask = {
        id: Date.now(),
        text: taskText,
        difficulty: difficultySelect.value,
        completed: false
    };
    
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    updateTasksCounter();
    
    // Limpar o campo de entrada
    taskInput.value = '';
    taskInput.focus();
}

// Função para criar elemento de tarefa
function createTaskElement(task) {
    const taskItem = document.createElement('li');
    taskItem.classList.add('task-item');
    if (task.completed) {
        taskItem.classList.add('completed');
    }
    taskItem.setAttribute('data-id', task.id);
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add('task-checkbox');
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTaskStatus(task.id));
    
    const taskContent = document.createElement('div');
    taskContent.classList.add('task-content');
    
    const taskText = document.createElement('span');
    taskText.classList.add('task-text');
    taskText.textContent = task.text;
    
    const taskDifficulty = document.createElement('span');
    taskDifficulty.classList.add('task-difficulty', task.difficulty);
    
    // Definir o texto da dificuldade em português
    let difficultyText = '';
    switch(task.difficulty) {
        case 'facil':
            difficultyText = 'Fácil';
            break;
        case 'medio':
            difficultyText = 'Médio';
            break;
        case 'dificil':
            difficultyText = 'Difícil';
            break;
        default:
            difficultyText = 'Fácil';
    }
    
    taskDifficulty.textContent = difficultyText;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('task-delete');
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    
    taskContent.appendChild(taskText);
    taskContent.appendChild(taskDifficulty);
    
    taskItem.appendChild(checkbox);
    taskItem.appendChild(taskContent);
    taskItem.appendChild(deleteBtn);
    
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