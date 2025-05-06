const jwt = require('jsonwebtoken');

const JWT_SECRET = 'seu_jwt_secret'; // Em produção, use variáveis de ambiente

// Middleware para verificar o token JWT
exports.authenticateToken = (req, res, next) => {
    try {
        // Obter o token do cookie ou do header Authorization
        const token = req.cookies.jwt || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
        
        if (!token) {
            return res.status(401).json({ error: 'Não autorizado: Token não fornecido' });
        }
        
        // Verificar token
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ error: 'Não autorizado: Token inválido' });
            }
            
            req.user = {
                id: user.userId,
                role: user.role,
                name: user.name,
                email: user.email
            };
            
            next();
        });
    } catch (error) {
        console.error('Erro na autenticação:', error);
        res.status(500).json({ error: 'Erro interno na autenticação' });
    }
};

// Middleware para verificar se o usuário é administrador
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Acesso negado: Permissão de administrador necessária' });
    }
}; 