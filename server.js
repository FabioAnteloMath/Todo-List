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

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/tasks', authenticateToken, taskRoutes);

// Inicializar banco de dados
initDatabase();

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
}); 