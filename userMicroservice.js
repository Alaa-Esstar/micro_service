const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const db = require('./db');


const userProtoPath = 'user.proto';

const userProtoDefinition = protoLoader.loadSync(userProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const userProto = grpc.loadPackageDefinition(userProtoDefinition).user;


const userService = {
    getUsers: (call, callback) => {
        const query = 'SELECT * FROM users';

        db.query(query, (error, results) => {
            if (error) {
                console.error('Erreur lors de l\'exécution de la requête SELECT :', error);
                callback({ message: 'Erreur serveur' }, null);
            } else {
                callback(null, { users: results });
            }
        });
    },
    getUser: (call, callback) => {
        const userId = call.request.user_id;
        const query = 'SELECT * FROM users WHERE id = ?';
        const values = [userId];

        db.query(query, values, (error, results) => {
            if (error) {
                console.error('Erreur lors de l\'exécution de la requête SELECT :', error);
                callback({ message: 'Erreur serveur' }, null);
            } else if (results.length > 0) {
                callback(null, { user: results[0] });
            } else {
                callback({ message: 'Utilisateur non trouvé' }, null);
            }
        });
    },
    createOrUpdateUser: (call, callback) => {
        const { user_id, name, email } = call.request;
        const query = 'INSERT INTO users (id, name, email) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), email = VALUES(email)';
        const values = [user_id, name, email];

        db.query(query, values, (error, result) => {
            if (error) {
                console.error('Erreur lors de l\'exécution de la requête INSERT/UPDATE :', error);
                callback({ message: 'Erreur serveur' }, null);
            } else {
                const insertedUser = { id: user_id, name, email };
                callback(null, { user: insertedUser });
            }
        });
    },
    deleteUser: (call, callback) => {
        const userId = call.request.user_id;
        const query = 'DELETE FROM users WHERE id = ?';
        const values = [userId];

        db.query(query, values, (error, result) => {
            if (error) {
                console.error('Erreur lors de l\'exécution de la requête DELETE :', error);
                callback({ message: 'Erreur serveur' }, null);
            } else if (result.affectedRows === 0) {
                callback({ message: 'Utilisateur non trouvé' }, null);
            } else {
                callback(null, { success: true });
            }
        });
    }
};

const server = new grpc.Server();
server.addService(userProto.UserService.service, userService);
const port = 50051;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.error('Failed to bind the server:', err);
        return;
    }
    console.log(`The server is running on port ${port}`);
    server.start();
});

console.log(`User microservice is running on port ${port}`);
