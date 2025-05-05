const sqlite3 = require('sqlite3').verbose();

function initDatabase() {
    const db = new sqlite3.Database('tasks.db', (err) => {
        if (err) {
            console.error('Erro ao conectar ao banco de dados:', err);
        } else {
            console.log('Conectado ao banco de dados SQLite');
            createTables(db);
        }
    });
    return db;
}

function createTables(db) {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        description TEXT,
        difficulty TEXT NOT NULL,
        completed BOOLEAN DEFAULT 0,
        approved BOOLEAN DEFAULT 0,
        assignedTo TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        dueDate DATETIME,
        deleted BOOLEAN DEFAULT 0,
        created_by INTEGER
    )`);
}

module.exports = { initDatabase }; 