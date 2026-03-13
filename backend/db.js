const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function setupDb() {
    const db = await open({
        filename: './grc.db',
        driver: sqlite3.Database
    });

    // Tables create karein
    await db.exec(`
        CREATE TABLE IF NOT EXISTS compliance_controls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            control_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT CHECK( status IN ('Compliant', 'Non-Compliant', 'Pending') ) DEFAULT 'Pending',
            evidence_path TEXT
        );

        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT DEFAULT 'Auditor'
        );
    `);

    // Safely check for evidence_path column (double security)
    try {
        await db.exec(`ALTER TABLE compliance_controls ADD COLUMN evidence_path TEXT;`);
    } catch (e) {
        // Column already exists, no problem
    }

    // Add dummy data if empty
    const controls = await db.all('SELECT * FROM compliance_controls');
    if (controls.length === 0) {
        await db.run('INSERT INTO compliance_controls (control_id, title, description, status) VALUES (?, ?, ?, ?)', 
        ['AC-1', 'Access Control Policy', 'Documented policy for user access.', 'Pending']);
    }

    console.log("SQLite Database Ready!");
    return db;
}

module.exports = setupDb;
