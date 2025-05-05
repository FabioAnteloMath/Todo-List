// Configurações da API
const API_BASE_URL = 'http://localhost:8080/api';

// Array para armazenar usuários
let users = [];

// Event listeners para as tabs do painel de gerenciamento
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
            
            if (tabName === 'users') {
                document.getElementById('users-list').classList.add('active');
                loadUsers();
            } else if (tabName === 'new-user') {
                document.getElementById('new-user').classList.add('active');
            }
        });
    });

    // Configurar formulário de novo usuário
    const newUserForm = document.getElementById('new-user-form');
    if (newUserForm) {
        newUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await createUser();
        });
    }

    // Carregar usuários iniciais
    loadUsers();
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

// Carregar usuários do servidor
async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/users`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Erro ao carregar usuários');
        }
        
        const data = await response.json();
        users = data.users || [];
        
        renderUsers();
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        showNotification('Erro ao carregar usuários', 'error');
    }
}

// Função para renderizar usuários
function renderUsers() {
    const tableBody = document.getElementById('users-table-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (users.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="5" class="text-center">Nenhum usuário encontrado</td>';
        tableBody.appendChild(tr);
        return;
    }
    
    users.forEach(user => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role === 'admin' ? 'Administrador' : 'Usuário'}</td>
            <td>${user.is_active ? '<span class="badge bg-success">Ativo</span>' : '<span class="badge bg-danger">Inativo</span>'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action ${user.is_active ? 'btn-deactivate' : 'btn-activate'}" onclick="toggleUserStatus(${user.id}, ${!user.is_active})">
                        <i class="fas ${user.is_active ? 'fa-user-slash' : 'fa-user-check'}"></i>
                        ${user.is_active ? 'Desativar' : 'Ativar'}
                    </button>
                    <button class="btn-action ${user.role === 'admin' ? 'btn-demote' : 'btn-promote'}" onclick="toggleUserRole(${user.id}, '${user.role === 'admin' ? 'user' : 'admin'}')">
                        <i class="fas ${user.role === 'admin' ? 'fa-user-minus' : 'fa-user-plus'}"></i>
                        ${user.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(tr);
    });
}

// Função para criar novo usuário
async function createUser() {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const roleSelect = document.getElementById('role');
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const role = roleSelect.value;
    
    if (!name || !email || !password) {
        showNotification('Todos os campos são obrigatórios', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ name, email, password, role })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao criar usuário');
        }
        
        showNotification('Usuário criado com sucesso', 'success');
        
        // Limpar formulário
        nameInput.value = '';
        emailInput.value = '';
        passwordInput.value = '';
        roleSelect.value = 'user';
        
        // Recarregar lista de usuários e mudar para a tab de lista
        await loadUsers();
        document.querySelector('.admin-tab[data-tab="users"]').click();
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        showNotification(error.message || 'Erro ao criar usuário', 'error');
    }
}

// Função para alternar status do usuário (ativo/inativo)
async function toggleUserStatus(userId, newStatus) {
    try {
        const user = users.find(u => u.id === userId);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        
        const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ 
                role: user.role,
                is_active: newStatus
            })
        });
        
        if (!response.ok) {
            throw new Error('Erro ao atualizar status do usuário');
        }
        
        showNotification(`Usuário ${newStatus ? 'ativado' : 'desativado'} com sucesso`, 'success');
        await loadUsers();
    } catch (error) {
        console.error('Erro ao alternar status do usuário:', error);
        showNotification(error.message || 'Erro ao atualizar usuário', 'error');
    }
}

// Função para alternar função do usuário (admin/user)
async function toggleUserRole(userId, newRole) {
    try {
        const user = users.find(u => u.id === userId);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        
        const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ 
                role: newRole,
                is_active: user.is_active
            })
        });
        
        if (!response.ok) {
            throw new Error('Erro ao atualizar função do usuário');
        }
        
        showNotification(`Função do usuário alterada para ${newRole === 'admin' ? 'Administrador' : 'Usuário'} com sucesso`, 'success');
        await loadUsers();
    } catch (error) {
        console.error('Erro ao alternar função do usuário:', error);
        showNotification(error.message || 'Erro ao atualizar usuário', 'error');
    }
}

// Função para mostrar notificação
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

// Função para logout
async function handleLogout() {
    try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        window.location.href = '/login.html';
    }
} 