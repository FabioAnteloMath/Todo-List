const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const authController = require('../controllers/authController');

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
router.get('/profile', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

// Atualizar perfil
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { name, email, currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        // Delegar a atualização de perfil para o controller
        const result = await authController.updateProfile(userId, name, email, currentPassword, newPassword);
        
        if (result.error) {
            return res.status(401).json({ error: result.error });
        }
        
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