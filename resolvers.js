const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { v4: uuidv4 } = require('uuid');

const userProtoPath = 'user.proto';
const reunionProtoPath = 'reunion.proto';

const userProtoDefinition = protoLoader.loadSync(userProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const reunionProtoDefinition = protoLoader.loadSync(reunionProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const userProto = grpc.loadPackageDefinition(userProtoDefinition).user;
const reunionProto = grpc.loadPackageDefinition(reunionProtoDefinition).reunion;

const clientUsers = new userProto.UserService('localhost:50051', grpc.credentials.createInsecure());
const clientReunions = new reunionProto.ReunionService('localhost:50052', grpc.credentials.createInsecure());

// Définir les résolveurs pour les requêtes GraphQL
const resolvers = {
    Query: {
        getUser: (_, { id }) => {
            return new Promise((resolve, reject) => {
                clientUsers.getUser({ user_id: id }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.user);
                    }
                });
            });
        },
        getUsers: () => {
            return new Promise((resolve, reject) => {
                clientUsers.getUsers({}, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.users);
                    }
                });
            });
        },
        getReunion: (_, { id }) => {
            return new Promise((resolve, reject) => {
                clientReunions.getReunion({ reunion_id: id }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.reunion);
                    }
                });
            });
        },
        getReunions: () => {
            return new Promise((resolve, reject) => {
                clientReunions.getReunions({}, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.reunions);
                    }
                });
            });
        },
    },
    Mutation: {
        createUser: (_, { name, email }) => {
            return new Promise((resolve, reject) => {
                const userId = uuidv4();
                clientUsers.createOrUpdateUser({ user_id: userId, name, email }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.user);
                    }
                });
            });
        },
        updateUser: (_, { id, name, email }) => {
            return new Promise((resolve, reject) => {
                clientUsers.createOrUpdateUser({ user_id: id, name, email }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.user);
                    }
                });
            });
        },
        deleteUser: (_, { id }) => {
            return new Promise((resolve, reject) => {
                clientUsers.deleteUser({ user_id: id }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ success: response.success, message: response.message });
                    }
                });
            });
        },
        createReunion: (_, { sujet, location, date, user_ids }) => {
            return new Promise((resolve, reject) => {
                const reunionId = uuidv4();
                clientReunions.createOrUpdateReunion({ reunion_id: reunionId, sujet, location, date, user_ids }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.reunion);
                    }
                });
            });
        },
        updateReunion: (_, { id, sujet, location, date, user_ids }) => {
            return new Promise((resolve, reject) => {
                clientReunions.createOrUpdateReunion({ reunion_id: id, sujet, location, date, user_ids }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.reunion);
                    }
                });
            });
        },
        deleteReunion: (_, { id }) => {
            return new Promise((resolve, reject) => {
                clientReunions.deleteReunion({ reunion_id: id }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ success: response.success, message: response.message });
                    }
                });
            });
        },
    },
};

module.exports = resolvers;
