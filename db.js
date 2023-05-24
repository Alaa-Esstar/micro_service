const mysql = require('mysql');

// Créez une connexion à la base de données MySQL
const connection = mysql.createConnection({
  host: 'localhost', // Remplacez par l'adresse de votre serveur MySQL
  user: 'root', // Remplacez par votre nom d'utilisateur MySQL
  password: '', // Remplacez par votre mot de passe MySQL
  database: 'micro_service_exam' // Remplacez par le nom de votre base de données
});

// Connectez-vous à la base de données
connection.connect((error) => {
  if (error) {
    console.error('Erreur de connexion à la base de données :', error);
  } else {
    console.log('Connecté à la base de données MySQL !');
  }
});

// Exportez la connexion pour l'utiliser dans d'autres fichiers
module.exports = connection;
