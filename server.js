
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
// Increase payload limit to handle large base64 images
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Database Setup
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initTables();
  }
});

function initTables() {
  // Profile table: Single row for store settings
  db.run(`CREATE TABLE IF NOT EXISTS store_profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL
  )`);

  // Items table: Stores items with JSON data
  db.run(`CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    created_at INTEGER,
    data TEXT NOT NULL
  )`);
}

// --- API Endpoints ---

// Get Profile
app.get('/api/profile', (req, res) => {
  db.get('SELECT data FROM store_profile WHERE id = 1', [], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row ? JSON.parse(row.data) : null);
  });
});

// Save Profile
app.post('/api/profile', (req, res) => {
  const profile = req.body;
  const json = JSON.stringify(profile);
  db.run(`INSERT OR REPLACE INTO store_profile (id, data) VALUES (1, ?)`, [json], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Profile saved successfully' });
  });
});

// Get All Items
app.get('/api/items', (req, res) => {
  db.all('SELECT data FROM items ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const items = rows.map(row => JSON.parse(row.data));
    res.json(items);
  });
});

// Save Item (Create or Update)
app.post('/api/items', (req, res) => {
  const item = req.body;
  const json = JSON.stringify(item);
  
  db.run(`INSERT OR REPLACE INTO items (id, created_at, data) VALUES (?, ?, ?)`, 
    [item.id, item.createdAt, json], 
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Item saved successfully', id: item.id });
    }
  );
});

// Delete Item
app.delete('/api/items/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM items WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Item deleted successfully' });
  });
});

// Serve Static Files (Frontend)
// Assuming the frontend files (index.html, JS) are in the same directory or 'dist'
app.use(express.static(__dirname));

// Fallback for SPA routing - send index.html for unknown non-API routes
app.get('*', (req, res) => {
  if (req.url.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
