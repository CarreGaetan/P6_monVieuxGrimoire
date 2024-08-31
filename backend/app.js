const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const stuffRoutes = require('./routes/stuff');
const userRoutes = require('./routes/user');

const app = express();

// Connexion à MongoDB
mongoose.connect('mongodb+srv://Uchiwa_Madara:Jsg1994ndl34amtp@cluster0.9do8t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Middleware pour parser les requêtes JSON
app.use(express.json());

// Configuration des en-têtes CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Options pour les requêtes pré-vol
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.send();
});

// Servir le dossier 'images' de manière statique
app.use('/images', express.static(path.join(__dirname, 'images')));

// Routes pour gérer les livres avec Multer pour l'upload d'images
app.use('/api/books', stuffRoutes);

// Routes pour gérer l'authentification
app.use('/api/auth', userRoutes);

module.exports = app;
