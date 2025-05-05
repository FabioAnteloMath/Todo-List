// Selecionando elementos DOM
const taskInput = document.getElementById('task-input');
const taskDescription = document.getElementById('task-description');
const difficultySelect = document.getElementById('difficulty-select');
const assignedUserSelect = document.getElementById('assigned-user');
const dueDateInput = document.getElementById('due-date');
const addButton = document.getElementById('add-button');
const taskList = document.getElementById('task-list');
const tasksCounter = document.getElementById('tasks-counter');
const clearCompletedBtn = document.getElementById('clear-completed');
const filters = document.querySelectorAll('.filter');
const difficultyFilters = document.querySelectorAll('.difficulty-filter');

// Verificar se os elementos essenciais existem
if (!taskList) {
    console.error('Elemento task-list não encontrado!');
}

// Array para armazenar tarefas
let tasks = [];

// Variável global para controlar status de admin
let isAdmin = false;

// Variáveis para controlar filtros ativos
let activeStatusFilter = 'all';
let activeDifficultyFilter = 'all';

// Configurações da API
const API_BASE_URL = 'https://matheusfabioantelo.github.io/Projeto-TO-DO/api';

// Variável para controlar número de notificações
let pendingNotifications = 0;

// Carregando tarefas do servidor quando a página carrega
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Tentar recuperar dados do usuário do localStorage primeiro
        const storedUser = localStorage.getItem('user');
        let user = storedUser ? JSON.parse(storedUser) : null;

        // Verificar autenticação com o servidor
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('Erro na verificação de autenticação:', response.status);
            // Se não estiver autenticado, limpar localStorage e redirecionar
            localStorage.removeItem('user');
            window.location.href = '/login.html';
            return;
        }

        // Atualizar dados do usuário com resposta do servidor
        const data = await response.json();
        console.log('Dados do usuário recebidos:', data);
        
        if (!data.user) {
            throw new Error('Dados do usuário não recebidos do servidor');
        }

        user = data.user;

        // Atualizar localStorage com dados mais recentes
        localStorage.setItem('user', JSON.stringify({
            name: user.name,
            role: user.role
        }));

        // Inicializar aplicação
        await initializeApp(user);
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    }
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

// Event listeners para as tabs do painel admin
document.addEventListener('DOMContentLoaded', () => {
    const adminTabs = document.querySelectorAll('.admin-tab');
    adminTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remover active de todas as tabs
            adminTabs.forEach(t => t.classList.remove('active'));
            // Adicionar active na tab clicada
            tab.classList.add('active');
            
            // Mostrar conteúdo correspondente
            const tabName = tab.getAttribute('data-tab');
            document.querySelectorAll('.admin-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabName}-tasks`).classList.add('active');
            
            // Carregar tarefas correspondentes
            if (tabName === 'pending') {
                renderPendingTasks();
            } else {
                renderApprovedTasks();
            }
        });
    });
});

// Função para formatar data
function formatDate(date) {
    if (!date) return 'Data não definida';
    
    try {
        // Se a data for uma string ISO, converter para objeto Date
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            console.error('Data inválida:', date);
            return 'Data inválida';
        }
        
        return dateObj.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.error('Erro ao formatar data:', error);
        return 'Erro na data';
    }
}

// Função para verificar se uma data está no passado
function isOverdue(date) {
    if (!date) return false;
    try {
        const dueDate = new Date(date);
        if (isNaN(dueDate.getTime())) return false;
        return dueDate < new Date();
    } catch (error) {
        console.error('Erro ao verificar data:', error);
        return false;
    }
}

// Função para carregar tarefas do servidor
async function loadTasks() {
    try {
        console.log('Carregando tarefas do servidor...');
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao carregar tarefas');
        }
        
        const data = await response.json();
        console.log('Dados recebidos do servidor:', data);
        
        // Garantir que tasks seja sempre um array e que os dados estejam no formato correto
        tasks = Array.isArray(data) ? data.map(task => {
            // Converter campos de data para o formato ISO
            const createdAt = task.createdAt || task.created_at;
            const dueDate = task.dueDate || task.due_date;
            
            return {
                id: task.id,
                text: task.text || '',
                description: task.description || '',
                difficulty: task.difficulty || 'medio',
                completed: Boolean(task.completed),
                approved: Boolean(task.approved),
                deleted: Boolean(task.deleted),
                assignedTo: task.assignedTo || task.assigned_to || '',
                createdAt: createdAt ? new Date(createdAt).toISOString() : null,
                dueDate: dueDate ? new Date(dueDate).toISOString() : null
            };
        }) : [];
        
        console.log('Tarefas processadas:', tasks);
        
        // Atualizar contador de notificações para admin
        if (isAdmin) {
            pendingNotifications = tasks.filter(task => task.completed && !task.approved).length;
            updateAdminNotification();
        }
        
        // Renderizar tarefas
        renderTasks();
        updateTasksCounter();
    } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
        showNotification('Erro ao carregar tarefas. Por favor, tente novamente.', 'error');
        tasks = []; // Garantir que tasks seja um array vazio em caso de erro
        renderTasks(); // Renderizar mesmo em caso de erro para mostrar mensagem de "nenhuma tarefa"
    }
}

// Função para adicionar uma nova tarefa
async function addTask() {
    const taskText = taskInput.value.trim();
    const description = taskDescription.value.trim();
    const assignedTo = assignedUserSelect.value;
    const dueDate = dueDateInput.value;
    
    // Validações
    if (taskText === '') return;
    
    // Validar seleção de usuário
    if (!assignedTo) {
        alert('Por favor, selecione um usuário para atribuir a tarefa.');
        assignedUserSelect.focus();
        return;
    }

    // Validar data de entrega
    if (!dueDate) {
        alert('Por favor, selecione uma data de entrega para a tarefa.');
        dueDateInput.focus();
        return;
    }
    
    const newTask = {
        text: taskText,
        description: description,
        difficulty: difficultySelect.value,
        assignedTo: assignedTo,
        dueDate: dueDate
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(newTask)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao criar tarefa');
        }
        
        const createdTask = await response.json();
        
        // Atualizar a lista de tarefas
        if (!Array.isArray(tasks)) {
            tasks = [];
        }
        tasks = [...tasks, createdTask];
        
        // Renderizar tarefas e atualizar contador
        renderTasks();
        updateTasksCounter();
        
        // Limpar os campos
        taskInput.value = '';
        taskDescription.value = '';
        assignedUserSelect.value = '';
        dueDateInput.value = '';
        taskInput.focus();
        
        // Mostrar notificação de sucesso
        showNotification('Tarefa criada com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao criar tarefa:', error);
        showNotification(error.message, 'error');
    }
}

// Função para alternar status de conclusão
async function toggleTaskStatus(taskId) {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/toggle`, {
            method: 'PATCH',
            credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Erro ao atualizar status da tarefa');
        
        const updatedTask = await response.json();
        const oldTask = tasks.find(t => t.id === taskId);
        tasks = tasks.map(task => task.id === taskId ? updatedTask : task);
        
        // Atualizar notificações baseado na mudança de status
        if (!oldTask.completed && updatedTask.completed) {
            pendingNotifications++;
            updateAdminNotification();
        } else if (oldTask.completed && !updatedTask.completed) {
            pendingNotifications = Math.max(0, pendingNotifications - 1);
            updateAdminNotification();
        }
        
        renderTasks();
        updateTasksCounter();
    } catch (error) {
        console.error('Erro ao atualizar status da tarefa:', error);
        alert('Erro ao atualizar status da tarefa. Por favor, tente novamente.');
    }
}

// Função para deletar uma tarefa (soft delete)
async function deleteTask(taskId) {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Erro ao deletar tarefa');
        
        tasks = tasks.filter(task => task.id !== taskId);
        renderTasks();
        updateTasksCounter();
    } catch (error) {
        console.error('Erro ao deletar tarefa:', error);
        alert('Erro ao deletar tarefa. Por favor, tente novamente.');
    }
}

// Função para atualizar uma tarefa
async function updateTask(taskId, updatedData) {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });
        
        if (!response.ok) throw new Error('Erro ao atualizar tarefa');
        
        const updatedTask = await response.json();
        tasks = tasks.map(task => task.id === taskId ? updatedTask : task);
        renderTasks();
    } catch (error) {
        console.error('Erro ao atualizar tarefa:', error);
        alert('Erro ao atualizar tarefa. Por favor, tente novamente.');
    }
}

// Função para salvar edição de tarefa
async function saveEdit(taskId, newText, newDescription, newDifficulty, assignedTo, dueDate) {
    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                text: newText,
                description: newDescription,
                difficulty: newDifficulty,
                assigned_to: assignedTo,
                due_date: dueDate
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao atualizar tarefa');
        }

        await fetchTasks(); // Recarregar lista de tarefas
        showAlert('Tarefa atualizada com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro:', error);
        showAlert('Erro ao atualizar tarefa', 'danger');
    }
}

// Função para renderizar tarefas baseada nos filtros atuais
function renderTasks() {
    console.log('Iniciando renderização de tarefas...');
    console.log('Total de tarefas:', tasks.length);
    
    // Limpar a lista de tarefas
    taskList.innerHTML = '';
    
    // Aplicar filtros
    let filteredTasks = tasks.filter(task => {
        // Ignorar tarefas deletadas
        if (task.deleted) return false;
        
        // Filtrar por status
        if (activeStatusFilter === 'active' && task.completed) return false;
        if (activeStatusFilter === 'completed' && !task.completed) return false;
        
        // Filtrar por dificuldade
        if (activeDifficultyFilter !== 'all' && task.difficulty !== activeDifficultyFilter) return false;
        
        // Se não for admin, mostrar apenas tarefas atribuídas ao usuário
        if (!isAdmin) {
            const currentUser = JSON.parse(localStorage.getItem('user'));
            if (task.assignedTo !== currentUser.name) return false;
        }
        
        return true;
    });

    console.log('Tarefas após filtros:', filteredTasks.length);
    
    // Ordenar tarefas: não completadas primeiro, depois por data de criação
    filteredTasks.sort((a, b) => {
        if (a.completed === b.completed) {
            // Se ambas estão no mesmo estado, ordenar por data de criação (mais recentes primeiro)
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
        // Colocar não completadas primeiro
        return a.completed ? 1 : -1;
    });
    
    // Renderizar tarefas filtradas
    if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.classList.add('no-tasks', 'text-center', 'p-4');
        emptyMessage.textContent = 'Nenhuma tarefa encontrada';
        taskList.appendChild(emptyMessage);
    } else {
        filteredTasks.forEach(task => {
            try {
                const taskElement = createTaskElement(task);
                taskList.appendChild(taskElement);
            } catch (error) {
                console.error('Erro ao criar elemento da tarefa:', error, task);
            }
        });
    }

    // Atualizar contador
    updateTasksCounter();
    
    console.log('Renderização concluída');
}

// Função para criar elemento de tarefa
function createTaskElement(task) {
    console.log('Criando elemento para tarefa:', task);
    
    const taskItem = document.createElement('li');
    taskItem.classList.add('task-item', 'card', 'mb-3');
    
    // Adicionar classes baseadas no status da tarefa
    if (task.completed) {
        taskItem.classList.add('completed');
    }
    
    if (task.dueDate && isOverdue(task.dueDate) && !task.completed) {
        taskItem.classList.add('overdue');
    }
    
    taskItem.setAttribute('data-id', task.id);
    
    const taskContent = document.createElement('div');
    taskContent.classList.add('card-body');
    
    const taskHeader = document.createElement('div');
    taskHeader.classList.add('task-header');
    
    // Checkbox para completar tarefa
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add('task-checkbox', 'form-check-input');
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTaskStatus(task.id));
    
    // Conteúdo principal da tarefa
    const contentWrapper = document.createElement('div');
    contentWrapper.classList.add('task-content-wrapper');
    
    const taskText = document.createElement('h5');
    taskText.classList.add('task-text', 'card-title', 'mb-2');
    taskText.textContent = task.text;
    
    const taskMeta = document.createElement('div');
    taskMeta.classList.add('task-meta', 'mb-2');
    
    // Badge de dificuldade
    const difficultyBadge = document.createElement('span');
    difficultyBadge.classList.add('badge', 'me-2');
    switch(task.difficulty) {
        case 'facil':
            difficultyBadge.classList.add('bg-success');
            difficultyBadge.textContent = 'Fácil';
            break;
        case 'medio':
            difficultyBadge.classList.add('bg-warning');
            difficultyBadge.textContent = 'Médio';
            break;
        case 'dificil':
            difficultyBadge.classList.add('bg-danger');
            difficultyBadge.textContent = 'Difícil';
            break;
    }
    taskMeta.appendChild(difficultyBadge);
    
    // Badge de usuário atribuído
    if (task.assignedTo) {
        const assignedBadge = document.createElement('span');
        assignedBadge.classList.add('badge', 'bg-info', 'me-2');
        assignedBadge.innerHTML = `<i class="fas fa-user"></i> ${task.assignedTo}`;
        taskMeta.appendChild(assignedBadge);
    }
    
    // Badge de status
    if (task.completed) {
        const statusBadge = document.createElement('span');
        statusBadge.classList.add('badge', 'bg-success', 'me-2');
        statusBadge.innerHTML = '<i class="fas fa-check"></i> Concluída';
        taskMeta.appendChild(statusBadge);
    }
    
    // Descrição da tarefa
    if (task.description) {
        const descriptionDiv = document.createElement('div');
        descriptionDiv.classList.add('task-description', 'text-muted', 'mb-2');
        descriptionDiv.textContent = task.description;
        contentWrapper.appendChild(descriptionDiv);
    }
    
    // Data de criação e prazo
    const dateInfo = document.createElement('div');
    dateInfo.classList.add('task-dates', 'text-muted', 'small');
    dateInfo.innerHTML = `
        <div>Criado em: ${formatDate(task.createdAt)}</div>
        ${task.dueDate ? `<div class="due-date ${isOverdue(task.dueDate) && !task.completed ? 'text-danger' : ''}">
            Prazo: ${formatDate(task.dueDate)}
        </div>` : ''}
    `;
    
    // Botões de ação
    const actionButtons = document.createElement('div');
    actionButtons.classList.add('task-actions');
    
    if (isAdmin && !task.approved) {
        // Botão de editar
        const editButton = document.createElement('button');
        editButton.classList.add('btn', 'btn-sm', 'btn-outline-primary', 'me-2');
        editButton.innerHTML = '<i class="fas fa-edit"></i>';
        editButton.addEventListener('click', () => startEditing(task.id));
        actionButtons.appendChild(editButton);
        
        // Botão de deletar
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('btn', 'btn-sm', 'btn-outline-danger');
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.addEventListener('click', () => deleteTask(task.id));
        actionButtons.appendChild(deleteButton);
    }
    
    // Montando a estrutura do card
    contentWrapper.appendChild(taskText);
    contentWrapper.appendChild(taskMeta);
    
    taskHeader.appendChild(checkbox);
    taskHeader.appendChild(contentWrapper);
    taskHeader.appendChild(actionButtons);
    
    taskContent.appendChild(taskHeader);
    taskContent.appendChild(dateInfo);
    
    taskItem.appendChild(taskContent);
    
    return taskItem;
}

// Função para limpar tarefas concluídas
function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    renderTasks();
    updateTasksCounter();
}

// Função para atualizar o contador de tarefas
function updateTasksCounter() {
    try {
        // Filtrar tarefas não deletadas e não aprovadas
        const activeTasks = tasks.filter(task => !task.deleted && !task.completed).length;
        console.log('Contagem de tarefas ativas:', activeTasks);
        tasksCounter.textContent = `${activeTasks} ${activeTasks === 1 ? 'tarefa restante' : 'tarefas restantes'}`;
    } catch (error) {
        console.error('Erro ao atualizar contador:', error);
        tasksCounter.textContent = '0 tarefas restantes';
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
        saveEdit(taskId, editInput.value, editDescription.value, editDifficulty.value, task.assignedTo, task.dueDate)
    );
    
    cancelButton.addEventListener('click', () => cancelEdit(taskId));
    
    taskContent.style.display = 'none';
    taskItem.appendChild(editForm);
}

function cancelEdit(taskId) {
    renderTasks();
}

// Função para carregar usuários
async function loadUsers() {
    try {
        console.log('Carregando lista de usuários...');
        const response = await fetch(`${API_BASE_URL}/tasks/users`, {
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao carregar usuários: ' + response.status);
        }
        
        const users = await response.json();
        console.log('Usuários carregados:', users);
        
        const assignedUserSelect = document.getElementById('assigned-user');
        if (!assignedUserSelect) {
            console.log('Select de usuários não encontrado na página atual');
            return; // Retorna silenciosamente se o elemento não existir
        }
        
        // Limpar opções existentes, mantendo apenas a opção padrão
        assignedUserSelect.innerHTML = '<option value="">Selecione um usuário</option>';
        
        // Adicionar usuários da base de dados
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.name;
            option.textContent = user.name;
            assignedUserSelect.appendChild(option);
        });
        
        console.log('Select de usuários atualizado com sucesso');
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        // Não redireciona para login aqui, apenas registra o erro
    }
}

// Função para inicializar aplicação após autenticação
async function initializeApp(user) {
    try {
        console.log('Inicializando aplicação para o usuário:', user);
        
        // Definir status de admin global
        isAdmin = user.role === 'admin';

        // Atualizar nome do usuário na navbar se o elemento existir
        const userNameElement = document.getElementById('user-name');
        if (userNameElement) {
            userNameElement.textContent = user.name;
        }

        // Configurar visibilidade dos elementos baseado no papel do usuário
        const adminPanelButton = document.getElementById('admin-panel');
        const adminPanelContent = document.querySelector('.admin-panel');
        const clearCompletedButton = document.getElementById('clear-completed');
        const taskCreationForm = document.querySelector('.add-task');

        // Configurar formulário de criação de tarefas
        if (taskCreationForm) {
            taskCreationForm.style.display = user.role === 'admin' ? 'block' : 'none';
        }

        // Configurar botão do painel admin se existir
        if (adminPanelButton) {
            if (user.role === 'admin') {
                adminPanelButton.style.display = 'flex';
                adminPanelButton.addEventListener('click', () => {
                    window.location.href = '/admin.html';
                });
            } else {
                adminPanelButton.style.display = 'none';
            }
        }

        // Configurar conteúdo do painel admin se existir
        if (adminPanelContent) {
            adminPanelContent.style.display = user.role === 'admin' ? 'block' : 'none';
        }

        // Configurar botão de limpar concluídas se existir
        if (clearCompletedButton) {
            clearCompletedButton.style.display = user.role === 'admin' ? 'none' : 'none';
        }

        // Carregar usuários e tarefas
        await loadUsers(); // Carregar usuários para todos os tipos de usuário
        await loadTasks();
        
        console.log('Aplicação inicializada com sucesso');
    } catch (error) {
        console.error('Erro ao inicializar aplicação:', error);
        // Se houver erro crítico, redirecionar para login
        window.location.href = '/login.html';
    }
}

// Função para fazer logout
async function handleLogout() {
    try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        // Mesmo com erro, limpar dados locais e redirecionar
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    }
}

// Função para renderizar tarefas no painel admin
function renderAdminTasks(tasks) {
    const adminTaskList = document.getElementById('admin-task-list');
    adminTaskList.innerHTML = '';

    tasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.classList.add('admin-task-item');

        const taskInfo = document.createElement('div');
        taskInfo.classList.add('admin-task-info');

        const taskTitle = document.createElement('div');
        taskTitle.classList.add('admin-task-title');
        taskTitle.textContent = task.text;

        const taskMeta = document.createElement('div');
        taskMeta.classList.add('admin-task-meta');
        taskMeta.innerHTML = `
            <span>Atribuído para: ${task.assignedTo}</span>
            <span>Dificuldade: ${task.difficulty}</span>
            <span>Entrega: ${formatDate(task.dueDate)}</span>
        `;

        taskInfo.appendChild(taskTitle);
        taskInfo.appendChild(taskMeta);

        const taskStatus = document.createElement('div');
        taskStatus.classList.add('admin-task-status');

        if (task.completed) {
            const approveButton = document.createElement('button');
            approveButton.classList.add('admin-approve-btn');
            approveButton.innerHTML = '<i class="fas fa-check"></i> Aprovar Conclusão';
            approveButton.onclick = () => approveTaskCompletion(task.id);
            taskStatus.appendChild(approveButton);
        } else {
            taskStatus.innerHTML = '<span>Em andamento</span>';
        }

        taskItem.appendChild(taskInfo);
        taskItem.appendChild(taskStatus);
        adminTaskList.appendChild(taskItem);
    });
}

// Função para aprovar a conclusão de uma tarefa
async function approveTaskCompletion(taskId) {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/approve`, {
            method: 'PATCH',
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Erro ao aprovar conclusão da tarefa');

        const updatedTask = await response.json();
        tasks = tasks.map(task => task.id === taskId ? updatedTask : task);
        renderTasks();
        loadTasks(); // Recarregar todas as tarefas
    } catch (error) {
        console.error('Erro ao aprovar conclusão da tarefa:', error);
        alert('Erro ao aprovar conclusão da tarefa. Por favor, tente novamente.');
    }
}

// Função para obter usuário atual
async function getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Erro ao obter perfil do usuário');
    return response.json();
}

// Função para buscar tarefas
async function fetchTasks() {
    try {
        const response = await fetch('/api/tasks', {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao buscar tarefas');
        }
        
        const tasks = await response.json();
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = '';
        
        // Ordenar tarefas: primeiro as não concluídas, depois por data de criação
        tasks.sort((a, b) => {
            if (a.completed === b.completed) {
                // Se ambas estão no mesmo estado de conclusão, ordenar por data
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
            // Colocar não concluídas primeiro
            return a.completed ? 1 : -1;
        });
        
        tasks.forEach(task => {
            const taskElement = createTaskElement({
                id: task.id,
                text: task.text,
                completed: task.completed,
                approved: task.approved,
                createdAt: task.created_at,
                dueDate: task.due_date,
                description: task.description,
                difficulty: task.difficulty,
                assignedTo: task.assigned_to
            });
            taskList.appendChild(taskElement);
        });
        
        updateTaskCounter(tasks);
        
    } catch (error) {
        console.error('Erro:', error);
        showAlert('Erro ao carregar tarefas', 'danger');
    }
}

function handleEditSubmit(event) {
    event.preventDefault();
    const taskId = editingTaskId;
    const newText = document.getElementById('edit-text').value;
    const newDescription = document.getElementById('edit-description').value;
    const newDifficulty = document.getElementById('edit-difficulty').value;
    const assignedTo = document.getElementById('edit-assigned-to').value;
    const dueDate = document.getElementById('edit-due-date').value;

    if (!newText.trim()) {
        showAlert('O texto da tarefa não pode estar vazio', 'danger');
        return;
    }

    saveEdit(taskId, newText, newDescription, newDifficulty, assignedTo, dueDate);
    closeEditModal();
}

function fillEditModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    document.getElementById('edit-text').value = task.text;
    document.getElementById('edit-description').value = task.description || '';
    document.getElementById('edit-difficulty').value = task.difficulty || 'médio';
    
    // Garantir que o select de usuários está preenchido
    const editAssignedToSelect = document.getElementById('edit-assigned-to');
    
    // Limpar opções existentes e adicionar a opção padrão
    editAssignedToSelect.innerHTML = '<option value="">Selecione um usuário</option>';
    
    // Tentar carregar usuários para o select
    fetch(`${API_BASE_URL}/tasks/users`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
    })
    .then(response => response.json())
    .then(users => {
        // Adicionar usuários ao select
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.name;
            option.textContent = user.name;
            editAssignedToSelect.appendChild(option);
        });
        
        // Definir o valor selecionado
        editAssignedToSelect.value = task.assignedTo || '';
    })
    .catch(error => {
        console.error('Erro ao carregar usuários para o modal de edição:', error);
    });
    
    document.getElementById('edit-due-date').value = task.dueDate || '';
    
    // Armazena o ID da tarefa sendo editada
    currentEditingTaskId = taskId;
}

function saveEditedTask() {
    const taskIndex = tasks.findIndex(t => t.id === currentEditingTaskId);
    if (taskIndex === -1) return;

    const editedTask = {
        id: currentEditingTaskId,
        text: document.getElementById('edit-text').value,
        description: document.getElementById('edit-description').value,
        difficulty: document.getElementById('edit-difficulty').value,
        assignedTo: document.getElementById('edit-assigned-to').value,
        dueDate: document.getElementById('edit-due-date').value,
        completed: tasks[taskIndex].completed
    };

    tasks[taskIndex] = editedTask;
    saveTasks();
    renderTasks();
    closeEditModal();
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
    currentEditingTaskId = null;
}

// Função para renderizar tarefas pendentes
async function renderPendingTasks() {
    const pendingTasksContainer = document.querySelector('#pending-tasks .admin-task-list');
    pendingTasksContainer.innerHTML = '';
    
    // Filtrar tarefas que estão concluídas mas não aprovadas
    const pendingTasks = tasks.filter(task => 
        task.completed && 
        !task.approved && 
        !task.deleted
    );
    
    if (pendingTasks.length === 0) {
        pendingTasksContainer.innerHTML = '<div class="no-tasks">Não há tarefas pendentes de aprovação</div>';
        return;
    }
    
    pendingTasks.forEach(task => {
        const taskElement = createAdminTaskElement(task);
        pendingTasksContainer.appendChild(taskElement);
    });
}

// Função para renderizar tarefas aprovadas
async function renderApprovedTasks() {
    const approvedTasksContainer = document.querySelector('#approved-tasks .admin-task-list');
    approvedTasksContainer.innerHTML = '';
    
    // Filtrar tarefas que estão concluídas e aprovadas
    const approvedTasks = tasks.filter(task => 
        task.completed && 
        task.approved && 
        !task.deleted
    );
    
    if (approvedTasks.length === 0) {
        approvedTasksContainer.innerHTML = '<div class="no-tasks">Não há tarefas aprovadas</div>';
        return;
    }
    
    approvedTasks.forEach(task => {
        const taskElement = createAdminTaskElement(task, true);
        approvedTasksContainer.appendChild(taskElement);
    });
}

// Função para criar elemento de tarefa no painel admin
function createAdminTaskElement(task, isApproved = false) {
    const taskElement = document.createElement('div');
    taskElement.classList.add('admin-task-item');
    
    const taskInfo = document.createElement('div');
    taskInfo.classList.add('admin-task-info');
    
    taskInfo.innerHTML = `
        <div class="admin-task-title">${task.text}</div>
        <div class="admin-task-meta">
            <span><i class="fas fa-user"></i> ${task.assignedTo}</span>
            <span><i class="fas fa-calendar"></i> ${formatDate(task.dueDate)}</span>
            <span><i class="fas fa-signal"></i> ${task.difficulty}</span>
        </div>
        ${task.description ? `<div class="admin-task-description">${task.description}</div>` : ''}
    `;
    
    const taskActions = document.createElement('div');
    taskActions.classList.add('admin-task-actions');
    
    if (!isApproved) {
        const approveButton = document.createElement('button');
        approveButton.classList.add('admin-approve-btn');
        approveButton.innerHTML = '<i class="fas fa-check"></i> Aprovar';
        approveButton.onclick = () => approveTask(task.id);
        taskActions.appendChild(approveButton);
    } else {
        const approvedBadge = document.createElement('span');
        approvedBadge.classList.add('badge', 'bg-success');
        approvedBadge.innerHTML = '<i class="fas fa-check-circle"></i> Aprovado';
        taskActions.appendChild(approvedBadge);
    }
    
    taskElement.appendChild(taskInfo);
    taskElement.appendChild(taskActions);
    
    return taskElement;
}

// Função para aprovar uma tarefa
async function approveTask(taskId) {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/approve`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao aprovar tarefa');
        }

        // Atualizar a tarefa na lista local
        tasks = tasks.map(task => task.id === taskId ? data : task);
        
        // Atualizar ambas as visualizações
        renderPendingTasks();
        renderApprovedTasks();
        renderTasks(); // Atualizar a lista principal de tarefas
        
        // Mostrar feedback visual
        showNotification('Tarefa aprovada com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao aprovar tarefa:', error);
        showNotification(error.message, 'error');
    }
}

// Função para mostrar notificação
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.classList.add('notification', `notification-${type}`);
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Função para atualizar o contador de notificações
function updateAdminNotification() {
    const adminButton = document.getElementById('admin-panel');
    const notificationBadge = adminButton?.querySelector('.notification-badge');
    
    if (!notificationBadge) return;
    
    if (pendingNotifications > 0) {
        notificationBadge.textContent = pendingNotifications;
        notificationBadge.style.display = 'flex';
    } else {
        notificationBadge.style.display = 'none';
    }
} 