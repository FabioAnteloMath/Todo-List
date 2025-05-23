const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const config = require('../config/database');

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }
        const existingUser = await userModel.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Verificar se quem está criando o usuário é um admin
        let userRole = 'user';
        if (req.user && req.user.role === 'admin' && role) {
            userRole = role;
        }
        
        await userModel.createUser(name, email, hashedPassword, userRole);
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
        const token = jwt.sign(
            { 
                userId: user.id, 
                role: user.role, 
                name: user.name,
                email: user.email 
            }, 
            'seu_jwt_secret', 
            { expiresIn: '1d' }
        );
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
        console.log('Atualizando perfil:', { userId, name, email, temSenhaAtual: !!currentPassword, temSenhaNova: !!newPassword });
        
        if (newPassword) {
            // Obter usuário para verificar a senha atual
            const user = await userModel.getUserById(userId);
            console.log('Usuário encontrado:', !!user);
            
            if (!user) {
                return { error: 'Usuário não encontrado' };
            }

            // Verificar senha atual
            const validPassword = await bcrypt.compare(currentPassword, user.password);
            console.log('Senha atual válida:', validPassword);
            
            if (!validPassword) {
                return { error: 'Senha atual incorreta' };
            }

            // Criptografar nova senha
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            console.log('Nova senha hash gerada');
            
            // Atualizar usuário com nova senha
            await userModel.updateUserProfile(userId, name, email, hashedPassword);
            console.log('Perfil com nova senha atualizado com sucesso');
        } else {
            // Atualizar apenas nome e email
            await userModel.updateUserProfile(userId, name, email);
            console.log('Perfil sem nova senha atualizado com sucesso');
        }
        
        return { success: true };
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        return { error: 'Erro ao atualizar perfil' };
    }
}; 