const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const setupDb = require('./db');

const app = express();
const SECRET_KEY = "saad_cyber_security_secret_123";

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

let db;

// Storage setup
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Security Middleware (MUST BE BEFORE ROUTES)
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Access Denied" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid Token" });
        req.user = user;
        next();
    });
};

setupDb().then((database) => {
    db = database;
    app.listen(5000, () => console.log("Backend running on port 5000"));
});

// AUTH ROUTES
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
        res.json({ message: "Registered" });
    } catch (err) { res.status(500).json({ error: "User already exists" }); }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    } else { res.status(401).json({ error: "Invalid credentials" }); }
});

// PROTECTED ROUTES
app.get('/api/controls', authenticateToken, async (req, res) => {
    const controls = await db.all('SELECT * FROM compliance_controls');
    res.json(controls);
});

app.put('/api/controls/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    await db.run('UPDATE compliance_controls SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: "Updated" });
});

app.post('/api/upload/:id', authenticateToken, upload.single('evidence'), async (req, res) => {
    const { id } = req.params;
    await db.run('UPDATE compliance_controls SET status = ?, evidence_path = ? WHERE id = ?', 
    ['Compliant', req.file.path, id]);
    res.json({ message: "Uploaded" });
});
