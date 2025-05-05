const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const config = require('../config/database');

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }
        const existingUser = await userModel.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await userModel.createUser(name, email, hashedPassword);
        res.status(201).json({ message: 'Usuário criado com sucesso' });
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ error: 'Erro ao registrar usuário' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.getUserByEmail(email);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        const token = jwt.sign({ userId: user.id, role: user.role, name: user.name }, 'seu_jwt_secret', { expiresIn: '1d' });
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
            maxAge: 24 * 60 * 60 * 1000
        });
        const { password: _, ...userData } = user;
        res.json({ user: userData });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro ao fazer login' });
    }
};

exports.listUsers = async (req, res) => {
    try {
        const users = await userModel.getAllUsers();
        res.json({ users });
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ error: 'Erro ao listar usuários' });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { role, is_active } = req.body;
        const userId = req.params.id;
        await userModel.updateUser(userId, role, is_active);
        res.json({ message: 'Usuário atualizado com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
};

exports.updateProfile = async (userId, name, email, currentPassword, newPassword) => {
    try {
        if (newPassword) {
            // Obter usuário para verificar a senha atual
            const user = await userModel.getUserById(userId);
            if (!user) {
                return { error: 'Usuário não encontrado' };
            }

            // Verificar senha atual
            const validPassword = await bcrypt.compare(currentPassword, user.password);
            if (!validPassword) {
                return { error: 'Senha atual incorreta' };
            }

            // Criptografar nova senha
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            // Atualizar usuário com nova senha
            await userModel.updateUserProfile(userId, name, email, hashedPassword);
        } else {
            // Atualizar apenas nome e email
            await userModel.updateUserProfile(userId, name, email);
        }
        
        return { success: true };
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        return { error: 'Erro ao atualizar perfil' };
    }
}; 