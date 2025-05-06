const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/task');
const { authenticateToken } = require('./middleware/auth');
const { initDatabase } = require('./config/database');

const app = express();
const port = 8080;

// Middleware
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:8080',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para logging de requisições
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
    
    // Para métodos POST e PUT, logar também o corpo da requisição (sem senhas)
    if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
        // Fazer uma cópia do corpo para não modificar a requisição original
        const bodyCopy = { ...req.body };
        
        // Ocultar senhas por segurança
        if (bodyCopy.password) bodyCopy.password = '[REDACTED]';
        if (bodyCopy.newPassword) bodyCopy.newPassword = '[REDACTED]';
        if (bodyCopy.currentPassword) bodyCopy.currentPassword = '[REDACTED]';
        
        console.log(`[${timestamp}] Corpo da requisição:`, bodyCopy);
    }
    
    next();
});

// Configuração para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rota para servir o arquivo index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para servir o arquivo admin.html
app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Rota para servir o arquivo login.html
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Rota para servir a página de teste de alteração de senha
app.get('/test-password.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'test-password.html'));
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/tasks', authenticateToken, taskRoutes);

// Inicializar banco de dados
initDatabase();

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
}); 