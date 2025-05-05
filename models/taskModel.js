const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('tasks.db');

exports.createTask = (text, description, difficulty, assignedTo, dueDate, createdBy) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO tasks (text, description, difficulty, assignedTo, dueDate, created_by) VALUES (?, ?, ?, ?, ?, ?)`,
            [text, description, difficulty, assignedTo, dueDate, createdBy],
            function (err) {
                if (err) return reject(err);
                db.get('SELECT * FROM tasks WHERE id = ?', [this.lastID], (err, row) => {
                    if (err) return reject(err);
                    resolve(row);
                });
            }
        );
    });
};

exports.listTasks = (user) => {
    return new Promise((resolve, reject) => {
        let query, params;
        if (user.role === 'admin') {
            query = `SELECT t.*, u.name as createdByName FROM tasks t LEFT JOIN users u ON t.created_by = u.id WHERE t.deleted = 0 ORDER BY t.createdAt DESC`;
            params = [];
        } else {
            query = `SELECT t.*, u.name as createdByName FROM tasks t LEFT JOIN users u ON t.created_by = u.id WHERE t.assignedTo = ? AND t.deleted = 0 ORDER BY t.createdAt DESC`;
            params = [user.name];
        }
        db.all(query, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

exports.updateTask = (id, data, user) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT created_by FROM tasks WHERE id = ?', [id], (err, task) => {
            if (err || !task) return resolve(null);
            if (task.created_by !== user.id && user.role !== 'admin') return resolve(null);
            db.run(
                `UPDATE tasks SET text = ?, description = ?, difficulty = ?, completed = ?, assignedTo = ?, dueDate = ? WHERE id = ? AND deleted = 0`,
                [data.text, data.description, data.difficulty, data.completed, data.assignedTo, data.dueDate, id],
                function (err) {
                    if (err) return reject(err);
                    db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
                        if (err) return reject(err);
                        resolve(row);
                    });
                }
            );
        });
    });
};

exports.deleteTask = (id, user) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT created_by FROM tasks WHERE id = ?', [id], (err, task) => {
            if (err || !task) return resolve(null);
            if (task.created_by !== user.id && user.role !== 'admin') return resolve(null);
            db.run('UPDATE tasks SET deleted = 1 WHERE id = ?', [id], function (err) {
                if (err) return reject(err);
                resolve(this.changes > 0);
            });
        });
    });
};

exports.toggleTask = (id, user) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT created_by, assignedTo FROM tasks WHERE id = ?', [id], (err, task) => {
            if (err || !task) return resolve(null);
            if (user.role !== 'admin' && task.created_by !== user.id && task.assignedTo !== user.name) return resolve(null);
            db.run('UPDATE tasks SET completed = NOT completed, approved = 0 WHERE id = ? AND deleted = 0', [id], function (err) {
                if (err) return reject(err);
                db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
                    if (err) return reject(err);
                    resolve(row);
                });
            });
        });
    });
};

exports.approveTask = (id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, task) => {
            if (err || !task || !task.completed) return resolve(null);
            db.run('UPDATE tasks SET approved = 1 WHERE id = ?', [id], function (err) {
                if (err) return reject(err);
                db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
                    if (err) return reject(err);
                    resolve(row);
                });
            });
        });
    });
};

exports.listUsers = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT id, name, email FROM users WHERE role != "admin" AND is_active = 1', [], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}; 