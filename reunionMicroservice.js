const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const db = require('./db');


const reunionProtoPath = 'reunion.proto';

const reunionProtoDefinition = protoLoader.loadSync(reunionProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const reunionProto = grpc.loadPackageDefinition(reunionProtoDefinition).reunion;


const reunionService = {
    getReunions: (call, callback) => {
        const query = 'SELECT * FROM reunions';

        db.query(query, (error, results) => {
            if (error) {
                console.error('Erreur lors de l\'exécution de la requête SELECT :', error);
                callback({ message: 'Erreur serveur' }, null);
            } else {
                console.log(results);
                callback(null, { reunions: results });
            }
        });
    },
    getReunion: (call, callback) => {
        const reunionId = call.request.reunion_id;
        const query = 'SELECT * FROM reunions WHERE id = ?';
        const values = [reunionId];

        db.query(query, values, (error, results) => {
            if (error) {
                console.error('Erreur lors de l\'exécution de la requête SELECT :', error);
                callback({ message: 'Erreur serveur' }, null);
            } else if (results.length > 0) {
                console.log(results);
                callback(null, { reunion: results[0] });
            } else {
                callback({ message: 'Réunion non trouvée' }, null);
            }
        });
    },

    createOrUpdateReunion: (call, callback) => {
        const { reunion_id, sujet, date, location, user_ids } = call.request;
        const query = 'INSERT INTO reunions (id, sujet, date, location, user_ids) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE sujet = VALUES(sujet), date = VALUES(date), location = VALUES(location), user_ids = VALUES(user_ids)';
        const values = [reunion_id, sujet, date, location, user_ids.join(',')];

        db.query(query, values, (error, result) => {
            if (error) {
                console.error('Erreur lors de l\'exécution de la requête INSERT/UPDATE :', error);
                callback({ message: 'Erreur serveur' }, null);
            } else {
                const insertedReunion = { id: reunion_id, sujet, date, location, user_ids };
                callback(null, { reunion: insertedReunion });
            }
        });
    },

    deleteReunion: (call, callback) => {
        const reunionId = call.request.reunion_id;
        const query = 'DELETE FROM reunions WHERE id = ?';
        const values = [reunionId];

        db.query(query, values, (error, result) => {
            if (error) {
                console.error('Erreur lors de l\'exécution de la requête DELETE :', error);
                callback({ message: 'Erreur serveur' }, null);
            } else if (result.affectedRows === 0) {
                callback({ message: 'Réunion non trouvée' }, null);
            } else {
                callback(null, { success: true });
            }
        });
    },
    // Ajouter un utilisateur à une réunion
    addUserToReunion: (call, callback) => {
        const reunionId = call.request.reunion_id;
        const userId = call.request.user_id;
        const query = 'UPDATE reunions SET user_ids = CONCAT_WS(",", user_ids, ?) WHERE id = ?';
        const values = [userId, reunionId];

        db.query(query, values, (error, result) => {
            if (error) {
                console.error('Erreur lors de l\'ajout de l\'utilisateur à la réunion :', error);
                callback({ message: 'Erreur serveur' }, null);
            } else if (result.affectedRows === 0) {
                callback({ message: 'Réunion ou utilisateur non trouvé' }, null);
            } else {
                callback(null, { message: 'Utilisateur ajouté à la réunion avec succès' });
            }
        });
    },

    // Supprimer un utilisateur d'une réunion
    removeUserFromReunion: (call, callback) => {
        const reunionId = call.request.reunion_id;
        const userId = call.request.user_id;
        const query = 'UPDATE reunions SET user_ids = REPLACE(user_ids, CONCAT(?, ","), ""), user_ids = REPLACE(user_ids, CONCAT(",", ?), ""), user_ids = REPLACE(user_ids, ?, "") WHERE id = ?';
        const values = [userId, userId, userId, reunionId];

        db.query(query, values, (error, result) => {
            if (error) {
                console.error('Erreur lors de la suppression de l\'utilisateur de la réunion :', error);
                callback({ message: 'Erreur serveur' }, null);
            } else if (result.affectedRows === 0) {
                callback({ message: 'Réunion ou utilisateur non trouvé' }, null);
            } else {
                callback(null, { message: 'Utilisateur supprimé de la réunion avec succès' });
            }
        });
    },
};

const server = new grpc.Server();
server.addService(reunionProto.ReunionService.service, reunionService);
const port = 50052;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.error('Failed to bind the server:', err);
        return;
    }
    console.log(`The server is running on port ${port}`);
    server.start();
});

console.log(`reunion microservice is running on port ${port}`);
