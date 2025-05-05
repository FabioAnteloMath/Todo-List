const taskModel = require('../models/taskModel');

exports.createTask = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Apenas administradores podem criar tarefas' });
        }
        const { text, description, difficulty, assignedTo, dueDate } = req.body;
        if (!text || !difficulty || !assignedTo || !dueDate) {
            return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
        }
        const newTask = await taskModel.createTask(text, description, difficulty, assignedTo, dueDate, req.user.id);
        res.status(201).json(newTask);
    } catch (error) {
        console.error('Erro ao criar tarefa:', error);
        res.status(500).json({ error: 'Erro interno ao criar tarefa' });
    }
};

exports.listTasks = async (req, res) => {
    try {
        const tasks = await taskModel.listTasks(req.user);
        res.json(tasks);
    } catch (error) {
        console.error('Erro ao listar tarefas:', error);
        res.status(500).json({ error: 'Erro interno ao listar tarefas' });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const updated = await taskModel.updateTask(req.params.id, req.body, req.user);
        if (!updated) return res.status(404).json({ error: 'Tarefa não encontrada ou sem permissão' });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar tarefa' });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const deleted = await taskModel.deleteTask(req.params.id, req.user);
        if (!deleted) return res.status(404).json({ error: 'Tarefa não encontrada ou sem permissão' });
        res.json({ message: 'Tarefa marcada como deletada' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar tarefa' });
    }
};

exports.toggleTask = async (req, res) => {
    try {
        const toggled = await taskModel.toggleTask(req.params.id, req.user);
        if (!toggled) return res.status(404).json({ error: 'Tarefa não encontrada ou sem permissão' });
        res.json(toggled);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao alternar status da tarefa' });
    }
};

exports.approveTask = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Apenas administradores podem aprovar conclusões' });
        }
        const approved = await taskModel.approveTask(req.params.id);
        if (!approved) return res.status(404).json({ error: 'Tarefa não encontrada ou não concluída' });
        res.json(approved);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao aprovar tarefa' });
    }
};

exports.listUsers = async (req, res) => {
    try {
        const users = await taskModel.listUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
}; 