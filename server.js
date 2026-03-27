const express = require('express');
const mysql   = require('mysql2');
const cors    = require('cors');
const path    = require('path');
const multer  = require('multer');
const fs      = require('fs');

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (/image\/(jpeg|jpg|png|gif|webp)/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

const app  = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(uploadDir));

// --- UPLOAD ROUTE ---
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

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

// --- SLIDER ROUTES ---
app.get('/api/sliders', (req, res) => {
  db.query('SELECT * FROM sliders WHERE active=1 ORDER BY sort_order ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
app.get('/api/sliders/all', (req, res) => {
  db.query('SELECT * FROM sliders ORDER BY sort_order ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
app.post('/api/sliders', (req, res) => {
  const { title, subtitle, image_url, sort_order } = req.body;
  db.query('INSERT INTO sliders (title, subtitle, image_url, sort_order) VALUES (?,?,?,?)',
    [title, subtitle, image_url, sort_order || 0], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: result.insertId });
  });
});
app.put('/api/sliders/:id', (req, res) => {
  const { title, subtitle, image_url, sort_order, active } = req.body;
  db.query('UPDATE sliders SET title=?, subtitle=?, image_url=?, sort_order=?, active=? WHERE id=?',
    [title, subtitle, image_url, sort_order, active, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});
app.delete('/api/sliders/:id', (req, res) => {
  db.query('DELETE FROM sliders WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// --- PRODUCT ROUTES ---
app.get('/api/products', (req, res) => {
  db.query('SELECT * FROM products WHERE active=1 ORDER BY id ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
app.get('/api/products/all', (req, res) => {
  db.query('SELECT * FROM products ORDER BY id ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
app.post('/api/products', (req, res) => {
  const { name, description, price, emoji, image_url } = req.body;
  db.query('INSERT INTO products (name, description, price, emoji, image_url) VALUES (?,?,?,?,?)',
    [name, description, price, emoji || '📦', image_url || null], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: result.insertId });
  });
});
app.put('/api/products/:id', (req, res) => {
  const { name, description, price, emoji, image_url, active } = req.body;
  db.query('UPDATE products SET name=?, description=?, price=?, emoji=?, image_url=?, active=? WHERE id=?',
    [name, description, price, emoji, image_url || null, active, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});
app.delete('/api/products/:id', (req, res) => {
  db.query('DELETE FROM products WHERE id=?', [req.params.id], (err) => {
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
