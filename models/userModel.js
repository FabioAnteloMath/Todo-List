const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('tasks.db');

exports.getUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
};

exports.createUser = (name, email, password, role = 'user') => {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO users (name, email, password, role, is_active) VALUES (?, ?, ?, ?, 1)', [name, email, password, role], function(err) {
            if (err) return reject(err);
            resolve(this.lastID);
        });
    });
};

exports.getAllUsers = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT id, name, email, role, created_at, is_active FROM users', [], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

exports.updateUser = (id, role, is_active) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE users SET role = ?, is_active = ? WHERE id = ?', [role, is_active, id], function(err) {
            if (err) return reject(err);
            resolve(this.changes);
        });
    });
};

exports.getUserById = (id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
};

exports.updateUserProfile = (id, name, email, password = null) => {
    return new Promise((resolve, reject) => {
        let query, params;
        
        if (password) {
            query = 'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?';
            params = [name, email, password, id];
        } else {
            query = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
            params = [name, email, id];
        }
        
        db.run(query, params, function(err) {
            if (err) return reject(err);
            resolve(this.changes);
        });
    });
}; 