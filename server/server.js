// server/server.js
// Express backend using SQLite instead of MongoDB.
// SQLite is just a FILE — no separate database server to install or run.
// That's what makes the packaged .exe fully self-contained.

const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

function createServer(dbPath) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Opens the .db file, creating it if it doesn't exist yet
  const db = new Database(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      expression TEXT NOT NULL,
      result REAL NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const insertHistory = db.prepare('INSERT INTO history (expression, result) VALUES (?, ?)');
  const getHistory = db.prepare('SELECT * FROM history ORDER BY id DESC LIMIT 20');

  // ---- API: perform a calculation ----
  app.post('/api/calculate', (req, res) => {
    const { num1, num2, operator } = req.body;
    const a = Number(num1);
    const b = Number(num2);
    let result;

    switch (operator) {
      case '+':
        result = a + b;
        break;
      case '-':
        result = a - b;
        break;
      case '*':
        result = a * b;
        break;
      case '/':
        if (b === 0) return res.status(400).json({ error: 'Cannot divide by zero' });
        result = a / b;
        break;
      default:
        return res.status(400).json({ error: 'Unknown operator' });
    }

    insertHistory.run(`${a} ${operator} ${b}`, result);
    res.json({ result });
  });

  // ---- API: get past calculations ----
  app.get('/api/history', (req, res) => {
    res.json(getHistory.all());
  });

  return app;
}

module.exports = createServer;

// Lets you also run `node server.js` directly while developing,
// without opening the Electron window at all.
if (require.main === module) {
  const path = require('path');
  const app = createServer(path.join(__dirname, 'calculator.db'));
  app.listen(5000, () => {
    console.log('Calculator server (SQLite) running on http://localhost:5000');
  });
}
