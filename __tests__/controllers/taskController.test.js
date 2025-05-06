const taskController = require('../../controllers/taskController');
const taskModel = require('../../models/taskModel');

// Mock do modelo de tarefas
jest.mock('../../models/taskModel');

describe('Task Controller', () => {
  let req, res;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    req = {
      user: {
        id: 1,
        role: 'user'
      },
      params: {},
      body: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });
  
  describe('listTasks', () => {
    test('Deve listar tarefas com sucesso', async () => {
      // Mock de tarefas
      const mockTasks = [
        { id: 1, text: 'Tarefa 1', completed: false },
        { id: 2, text: 'Tarefa 2', completed: true }
      ];
      
      taskModel.listTasks.mockResolvedValue(mockTasks);
      
      await taskController.listTasks(req, res);
      
      expect(taskModel.listTasks).toHaveBeenCalledWith(req.user);
      expect(res.json).toHaveBeenCalledWith(mockTasks);
    });
    
    test('Deve retornar erro 500 quando ocorrer exceção', async () => {
      taskModel.listTasks.mockRejectedValue(new Error('Erro de banco de dados'));
      
      await taskController.listTasks(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro interno ao listar tarefas' });
    });
  });
}); 