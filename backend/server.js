const express = require('express');
const cors = require('cors');
const setupDb = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

let db;

// Database connect karke server start karein
setupDb().then((database) => {
    db = database;
    app.listen(5000, () => console.log("Server running on port 5000"));
});

// API Route: Get all controls
app.get('/api/controls', async (req, res) => {
    try {
        const controls = await db.all('SELECT * FROM compliance_controls');
        res.json(controls);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// API Route: Update control status
app.put('/api/controls/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await db.run('UPDATE compliance_controls SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: "Status updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
