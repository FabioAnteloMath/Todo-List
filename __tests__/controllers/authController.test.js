const authController = require('../../controllers/authController');
const userModel = require('../../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mockando os módulos necessários
jest.mock('../../models/userModel');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Auth Controller - Login', () => {
  let req, res;
  
  beforeEach(() => {
    // Reset dos mocks
    jest.clearAllMocks();
    
    // Objeto mock para request e response
    req = {
      body: {
        email: 'teste@example.com',
        password: 'senha123'
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn()
    };
  });
  
  test('Deve retornar erro 401 para credenciais inválidas', async () => {
    // Mock: usuário não encontrado
    userModel.getUserByEmail.mockResolvedValue(null);
    
    await authController.login(req, res);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Credenciais inválidas' });
  });
  
  test('Deve fazer login com sucesso e retornar token', async () => {
    // Mock: usuário encontrado e senha válida
    const mockUser = {
      id: 1,
      name: 'Teste',
      email: 'teste@example.com',
      password: 'hashedPassword',
      role: 'user'
    };
    
    userModel.getUserByEmail.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mock_token');
    
    await authController.login(req, res);
    
    expect(res.cookie).toHaveBeenCalledWith('jwt', 'mock_token', expect.any(Object));
    expect(res.json).toHaveBeenCalledWith({
      user: expect.objectContaining({
        id: 1,
        name: 'Teste',
        email: 'teste@example.com',
        role: 'user'
      })
    });
  });
}); 