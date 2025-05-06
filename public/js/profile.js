const API_BASE_URL = 'http://localhost:8080/api';

console.log('Script profile.js carregado');

// Função para configurar os listeners depois que o DOM for carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('Configurando event listeners');
    
    // Referências aos formulários
    const profileForm = document.getElementById('profile-form');
    const passwordForm = document.getElementById('password-form');
    
    console.log('Formulários encontrados:', { 
        profileForm: !!profileForm, 
        passwordForm: !!passwordForm 
    });
    
    // Manipular envio do formulário de perfil
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileSubmit);
        console.log('Event listener adicionado ao formulário de perfil');
    }
    
    // Manipular envio do formulário de senha
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordSubmit);
        console.log('Event listener adicionado ao formulário de senha');
    }
});

// Função para lidar com o envio do formulário de perfil
async function handleProfileSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    
    if (!name || !email) {
        showNotification('Todos os campos são obrigatórios', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ name, email })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao atualizar perfil');
        }
        
        showNotification('Perfil atualizado com sucesso', 'success');
        
        // Atualizar nome exibido no navbar
        document.getElementById('user-name').textContent = name;
        
        // Atualizar informações no localStorage
        const userData = JSON.parse(localStorage.getItem('user')) || {};
        userData.name = name;
        localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        showNotification(error.message || 'Erro ao atualizar perfil', 'error');
    }
}

// Função para lidar com o envio do formulário de senha
async function handlePasswordSubmit(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    console.log('Formulário de senha submetido');
    
    // Validações
    if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('Todos os campos são obrigatórios', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('As novas senhas não coincidem', 'error');
        return;
    }
    
    if (newPassword.length < 8) {
        showNotification('A nova senha deve ter pelo menos 8 caracteres', 'error');
        return;
    }
    
    try {
        // Obter nome e email atuais para enviar junto com a atualização
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        
        console.log('Enviando requisição para atualizar senha', { name, email, temSenhaAtual: !!currentPassword, temSenhaNova: !!newPassword });
        
        const body = { 
            name, 
            email, 
            currentPassword, 
            newPassword 
        };
        
        console.log('Dados sendo enviados:', JSON.stringify(body));
        
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(body)
        });
        
        console.log('Resposta recebida:', response.status);
        
        const responseData = await response.json();
        console.log('Dados da resposta:', responseData);
        
        if (!response.ok) {
            throw new Error(responseData.error || 'Erro ao atualizar senha');
        }
        
        showNotification('Senha atualizada com sucesso', 'success');
        
        // Limpar os campos de senha
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
    } catch (error) {
        console.error('Erro ao atualizar senha:', error);
        showNotification(error.message || 'Erro ao atualizar senha', 'error');
    }
}

// Função para mostrar notificação
window.showNotification = function(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.remove('success', 'error');
    notification.classList.add(type);
    notification.style.display = 'block';
    
    // Esconder a notificação após 5 segundos
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
} 