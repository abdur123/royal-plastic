const express = require('express');
const mysql   = require('mysql2');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// --- DB Connection ---
const db = mysql.createConnection({
  host:     'localhost',
  user:     'root',       // change if your HeidiSQL user is different
  password: '',           // add your MySQL password here if set
  database: 'royal_plastic_db'
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
  console.log('Connected to MySQL database.');
});

// --- Routes ---

// POST /api/messages  → save a new message
app.post('/api/messages', (req, res) => {
  const { name, phone, message } = req.body;

  if (!name || !phone || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const sql = 'INSERT INTO messages (name, phone, message) VALUES (?, ?, ?)';
  db.query(sql, [name, phone, message], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: result.insertId });
  });
});

// GET /api/messages   → fetch all messages
app.get('/api/messages', (req, res) => {
  db.query('SELECT * FROM messages ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// DELETE /api/messages/:id  → delete one message
app.delete('/api/messages/:id', (req, res) => {
  db.query('DELETE FROM messages WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// DELETE /api/messages  → delete all messages
app.delete('/api/messages', (req, res) => {
  db.query('DELETE FROM messages', (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// --- ORDER ROUTES ---

// POST /api/orders → place new order
app.post('/api/orders', (req, res) => {
  const { customer, phone, address, product, quantity, price } = req.body;
  if (!customer || !phone || !address || !product || !quantity || !price) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  const total = (parseFloat(price) * parseInt(quantity)).toFixed(2);
  const sql = 'INSERT INTO orders (customer, phone, address, product, quantity, price, total) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [customer, phone, address, product, quantity, price, total], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: result.insertId });
  });
});

// GET /api/orders → fetch all orders
app.get('/api/orders', (req, res) => {
  db.query('SELECT * FROM orders ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// PUT /api/orders/:id/status → update order status
app.put('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  db.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// DELETE /api/orders/:id → delete one order
app.delete('/api/orders/:id', (req, res) => {
  db.query('DELETE FROM orders WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
