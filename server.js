const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // For parsing application/json
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public' directory

// --- Routes API ---

// 1. GET /api/invites/:token : Récupérer les détails de l'invité
app.get('/api/invites/:token', async (req, res) => {
  const { token } = req.params;
  
  // Basic UUID format validation (optional but recommended)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(token)) {
    return res.status(400).json({ error: 'Format de token invalide.' });
  }

  try {
    // Utilisation de requêtes paramétrées pour éviter l'injection SQL
    const { rows } = await db.query(
      'SELECT id, nom, prenom, statut, allergies FROM invites WHERE token = $1',
      [token]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Invitation introuvable.' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'invitation:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// 2. PATCH /api/invites/:token/rsvp : Mettre à jour la présence et les allergies
app.patch('/api/invites/:token/rsvp', async (req, res) => {
  const { token } = req.params;
  const { statut, allergies } = req.body;

  // Validation des entrées (Input validation)
  if (!['Présent', 'Absent'].includes(statut)) {
    return res.status(400).json({ error: 'Statut invalide.' });
  }

  // Basic UUID format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(token)) {
    return res.status(400).json({ error: 'Format de token invalide.' });
  }

  try {
    // Mise à jour ciblée sur l'UUID pour s'assurer que l'utilisateur ne modifie que sa ligne
    const { rowCount } = await db.query(
      'UPDATE invites SET statut = $1, allergies = $2 WHERE token = $3',
      [statut, allergies, token]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Invitation introuvable ou non modifiée.' });
    }

    res.json({ message: 'RSVP mis à jour avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du RSVP:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Fallback pour la SPA (Single Page Application)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Création de la table de test (A enlever ou adapter en production)
const initializeDB = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS invites (
        id SERIAL PRIMARY KEY,
        token UUID UNIQUE NOT NULL,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        statut VARCHAR(20) DEFAULT 'En attente',
        allergies TEXT
      );
    `);
    
    // Insérer un invité de test si la table est vide
    const { rows } = await db.query('SELECT COUNT(*) FROM invites');
    if (parseInt(rows[0].count) === 0) {
        // UUID de test: 123e4567-e89b-12d3-a456-426614174000
        await db.query(`
          INSERT INTO invites (token, nom, prenom, statut) 
          VALUES ('123e4567-e89b-12d3-a456-426614174000', 'Doe', 'John', 'En attente')
        `);
        console.log('Invité de test créé avec le token: 123e4567-e89b-12d3-a456-426614174000');
    }
  } catch (err) {
    console.error('Erreur lors de l\'initialisation de la DB:', err.message);
  }
};

app.listen(PORT, async () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  await initializeDB();
});
