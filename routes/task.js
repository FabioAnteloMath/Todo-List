const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Todas as rotas já estão protegidas por authenticateToken no server.js
router.post('/', taskController.createTask);
router.get('/', taskController.listTasks);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);
router.patch('/:id/toggle', taskController.toggleTask);
router.patch('/:id/approve', taskController.approveTask);
router.get('/users', taskController.listUsers);

module.exports = router; 