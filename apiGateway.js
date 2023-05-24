const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const bodyParser = require('body-parser');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Charger les fichiers proto pour les microservices d'utilisateurs et de réunions
const userProtoPath = 'user.proto';
const reunionProtoPath = 'reunion.proto';
const resolvers = require('./resolvers');
const typeDefs = require('./schema');

// Créer une nouvelle application Express
const app = express();
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

// Créer une instance ApolloServer avec le schéma et les résolveurs importés
const server = new ApolloServer({ typeDefs, resolvers });

// Appliquer le middleware ApolloServer à l'application Express
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
server.start().then(() => {
    app.use(
        cors(),
        expressMiddleware(server),
    );
});

// Routes pour les utilisateurs
app.get('/users', (req, res) => {
    clientUsers.getUsers({}, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.users);
        }
    });
});

app.get('/users/:id', (req, res) => {
    const userId = req.params.id;
    clientUsers.getUser({ id: userId }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.user);
        }
    });
});

app.post('/users', (req, res) => {
    const { name, email } = req.body;
    clientUsers.createUser({ name, email }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.user);
        }
    });
});

app.put('/users/:id', (req, res) => {
    const userId = req.params.id;
    const { name, email } = req.body;
    clientUsers.updateUser({ id: userId, name, email }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.user);
        }
    });
});

app.delete('/users/:id', (req, res) => {
    const userId = req.params.id;
    clientUsers.deleteUser({ id: userId }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response);
        }
    });
});

// Routes pour les réunions
app.get('/reunions', (req, res) => {
    clientReunions.getReunions({}, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.reunions);
        }
    });
});

app.get('/reunions/:id', (req, res) => {
    const reunionId = req.params.id;
    clientReunions.getReunion({ id: reunionId }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.reunion);
        }
    });
});

app.post('/reunions', (req, res) => {
    const { sujet, date, location, user_ids } = req.body;
    clientReunions.createReunion({ sujet, date, location, user_ids }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.reunion);
        }
    });
});

app.put('/reunions/:id', (req, res) => {
    const reunionId = req.params.id;
    const { sujet, date, user_ids } = req.body;
    clientReunions.updateReunion({ id: reunionId, sujet, date, user_ids }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.reunion);
        }
    });
});

app.delete('/reunions/:id', (req, res) => {
    const reunionId = req.params.id;
    clientReunions.deleteReunion({ id: reunionId }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response);
        }
    });
});

// Ajouter un utilisateur à une réunion
app.post('/reunions/:reunionId/users/:userId', (req, res) => {
    const reunionId = req.params.reunionId;
    const userId = req.params.userId;
    clientReunions.addUserToReunion({ reunionId, userId }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response);
        }
    });
});

// Démarrer l'application Express
const port = 3000;
app.listen(port, () => {
    console.log(`API Gateway en cours d'exécution sur le port ${port}`);
});
