import 'dotenv/config'; // Load .env file
import express from 'express';
import { createRequire } from 'module';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

// Initialize require for CommonJS modules
const require = createRequire(import.meta.url);
const sqlite3 = require('sqlite3').verbose();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Change default port to 3000 to match standard browser attempts
const PORT = process.env.PORT || 3000;

app.use(cors());
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
  db.run(`CREATE TABLE IF NOT EXISTS store_profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    created_at INTEGER,
    data TEXT NOT NULL
  )`);
}

// API Endpoints
app.get('/api/profile', (req, res) => {
  db.get('SELECT data FROM store_profile WHERE id = 1', [], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row ? JSON.parse(row.data) : null);
  });
});

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

// Serve Static Files (Production Build)
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback for SPA routing
app.get('*', (req, res) => {
  if (req.url.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

// Server Start with Auto-Kill Logic for Port
const startServer = () => {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });

  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      console.log(`Port ${PORT} is in use. Attempting to kill the old process...`);
      
      // Try using fuser (common on Linux)
      exec(`fuser -k ${PORT}/tcp`, (err) => {
        if (err) {
           // Fallback to lsof if fuser is missing
           exec(`lsof -t -i:${PORT} | xargs kill -9`, (err2) => {
              if (err2) {
                console.error(`Failed to release port ${PORT}. Please kill the process manually.`);
                process.exit(1);
              } else {
                 console.log("Old process killed. Restarting server in 1s...");
                 setTimeout(startServer, 1000);
              }
           });
        } else {
           console.log("Old process killed. Restarting server in 1s...");
           setTimeout(startServer, 1000);
        }
      });
    } else {
      console.error("Server error:", e);
    }
  });
};

startServer();