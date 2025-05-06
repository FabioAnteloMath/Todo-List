const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const authController = require('../controllers/authController');
const userModel = require('../models/userModel');

const router = express.Router();

// Registro de usuário
router.post('/register', async (req, res, next) => {
    // Se o role for especificado e não for 'user', verificar se o usuário é admin
    if (req.body.role && req.body.role !== 'user') {
        return authenticateToken(req, res, () => {
            isAdmin(req, res, () => {
                authController.register(req, res);
            });
        });
    }
    
    // Caso contrário, permite o registro normal
    return authController.register(req, res);
});

// Login
router.post('/login', authController.login);

// Logout
router.post('/logout', (req, res) => {
    res.clearCookie('jwt');
    res.json({ message: 'Logout realizado com sucesso' });
});

// Obter perfil do usuário
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        // Buscar dados completos do usuário para garantir que temos o email
        const user = await userModel.getUserById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        // Remover a senha antes de enviar
        const { password, ...userData } = user;
        
        res.json({ user: userData });
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        res.status(500).json({ error: 'Erro ao buscar perfil do usuário' });
    }
});

// Atualizar perfil
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        console.log('Requisição recebida para atualizar perfil');
        console.log('Corpo da requisição:', req.body);
        console.log('Usuário autenticado:', req.user);
        
        const { name, email, currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        console.log('Dados extraídos:', { 
            userId, 
            name, 
            email, 
            temSenhaAtual: !!currentPassword, 
            temSenhaNova: !!newPassword 
        });

        // Validar os dados
        if (!name || !email) {
            console.log('Erro: Nome e email são obrigatórios');
            return res.status(400).json({ error: 'Nome e email são obrigatórios' });
        }

        // Se tiver senha nova, verificar se a senha atual também foi fornecida
        if (newPassword && !currentPassword) {
            console.log('Erro: Senha atual é obrigatória para alterar a senha');
            return res.status(400).json({ error: 'Senha atual é obrigatória para alterar a senha' });
        }

        // Validar tamanho mínimo da nova senha
        if (newPassword && newPassword.length < 8) {
            console.log('Erro: A nova senha deve ter pelo menos 8 caracteres');
            return res.status(400).json({ error: 'A nova senha deve ter pelo menos 8 caracteres' });
        }

        console.log('Encaminhando para o controller updateProfile');
        
        // Delegar a atualização de perfil para o controller
        const result = await authController.updateProfile(userId, name, email, currentPassword, newPassword);
        
        console.log('Resultado do controller:', result);
        
        if (result.error) {
            console.log('Erro retornado pelo controller:', result.error);
            return res.status(401).json({ error: result.error });
        }
        
        console.log('Perfil atualizado com sucesso');
        res.json({ message: 'Perfil atualizado com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
});

// Rotas administrativas
router.get('/users', authenticateToken, isAdmin, authController.listUsers);
router.put('/users/:id', authenticateToken, isAdmin, authController.updateUser);

module.exports = router; 