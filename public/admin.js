// Configurações da API
const API_BASE_URL = 'https://matheusfabioantelo.github.io/Projeto-TO-DO/api';

// Array para armazenar tarefas
let tasks = [];

// Event listeners para as tabs do painel admin
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAccess();
    
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

    // Carregar tarefas iniciais
    loadTasks();
});

// Verificar se o usuário é admin
async function checkAdminAccess() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            credentials: 'include'
        });

        if (!response.ok) {
            window.location.href = '/login.html';
            return;
        }

        const { user } = await response.json();
        if (user.role !== 'admin') {
            window.location.href = '/';
            return;
        }

        document.getElementById('user-name').textContent = user.name;
    } catch (error) {
        console.error('Erro ao verificar acesso:', error);
        window.location.href = '/login.html';
    }
}

// Carregar tarefas do servidor
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
        
        // Garantir que tasks seja sempre um array
        tasks = Array.isArray(data) ? data : [];
        
        // Processar os dados para garantir o formato correto
        tasks = tasks.map(task => ({
            ...task,
            completed: Boolean(task.completed),
            approved: Boolean(task.approved),
            deleted: Boolean(task.deleted),
            createdAt: task.createdAt || task.created_at,
            dueDate: task.dueDate || task.due_date,
            assignedTo: task.assignedTo || task.assigned_to || ''
        }));
        
        console.log('Tarefas processadas:', tasks);
        renderPendingTasks();
    } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
        showNotification('Erro ao carregar tarefas', 'error');
        tasks = []; // Garantir que tasks seja um array vazio em caso de erro
        renderPendingTasks();
    }
}

// Função para renderizar tarefas pendentes
async function renderPendingTasks() {
    console.log('Renderizando tarefas pendentes...');
    const pendingTasksContainer = document.querySelector('#pending-tasks .admin-task-list');
    if (!pendingTasksContainer) {
        console.error('Container de tarefas pendentes não encontrado');
        return;
    }
    
    pendingTasksContainer.innerHTML = '';
    
    // Garantir que tasks seja um array
    if (!Array.isArray(tasks)) {
        console.error('tasks não é um array:', tasks);
        tasks = [];
    }
    
    // Filtrar tarefas que estão concluídas mas não aprovadas
    const pendingTasks = tasks.filter(task => 
        task && 
        task.completed && 
        !task.approved && 
        !task.deleted
    );
    
    console.log('Tarefas pendentes encontradas:', pendingTasks.length);
    
    if (pendingTasks.length === 0) {
        pendingTasksContainer.innerHTML = '<div class="no-tasks">Não há tarefas pendentes de aprovação</div>';
        return;
    }
    
    pendingTasks.forEach(task => {
        try {
            const taskElement = createAdminTaskElement(task);
            pendingTasksContainer.appendChild(taskElement);
        } catch (error) {
            console.error('Erro ao criar elemento da tarefa:', error, task);
        }
    });
}

// Função para renderizar tarefas aprovadas
async function renderApprovedTasks() {
    console.log('Renderizando tarefas aprovadas...');
    const approvedTasksContainer = document.querySelector('#approved-tasks .admin-task-list');
    if (!approvedTasksContainer) {
        console.error('Container de tarefas aprovadas não encontrado');
        return;
    }
    
    approvedTasksContainer.innerHTML = '';
    
    // Garantir que tasks seja um array
    if (!Array.isArray(tasks)) {
        console.error('tasks não é um array:', tasks);
        tasks = [];
    }
    
    // Filtrar tarefas que estão concluídas e aprovadas
    const approvedTasks = tasks.filter(task => 
        task && 
        task.completed && 
        task.approved && 
        !task.deleted
    );
    
    console.log('Tarefas aprovadas encontradas:', approvedTasks.length);
    
    if (approvedTasks.length === 0) {
        approvedTasksContainer.innerHTML = '<div class="no-tasks">Não há tarefas aprovadas</div>';
        return;
    }
    
    approvedTasks.forEach(task => {
        try {
            const taskElement = createAdminTaskElement(task, true);
            approvedTasksContainer.appendChild(taskElement);
        } catch (error) {
            console.error('Erro ao criar elemento da tarefa:', error, task);
        }
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

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('admin-delete-btn');
    deleteButton.innerHTML = '<i class="fas fa-trash"></i> Excluir';
    deleteButton.onclick = () => deleteTask(task.id);
    taskActions.appendChild(deleteButton);
    
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
        
        // Mostrar feedback visual
        showNotification('Tarefa aprovada com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao aprovar tarefa:', error);
        showNotification(error.message, 'error');
    }
}

// Função para excluir uma tarefa
async function deleteTask(taskId) {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Erro ao excluir tarefa');
        }

        // Remover a tarefa da lista local
        tasks = tasks.filter(task => task.id !== taskId);
        
        // Atualizar ambas as visualizações
        renderPendingTasks();
        renderApprovedTasks();
        
        // Mostrar feedback visual
        showNotification('Tarefa excluída com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao excluir tarefa:', error);
        showNotification(error.message, 'error');
    }
}

// Função para formatar data
function formatDate(date) {
    return new Date(date).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
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

// Função para fazer logout
async function handleLogout() {
    try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
    }
} 