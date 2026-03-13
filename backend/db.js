const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function setupDb() {
    const db = await open({
        filename: './grc.db',
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS compliance_controls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            control_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT CHECK( status IN ('Compliant', 'Non-Compliant', 'Pending') ) DEFAULT 'Pending'
        );
    `);

    // Check if table is empty, then add dummy data
    const controls = await db.all('SELECT * FROM compliance_controls');
    if (controls.length === 0) {
        await db.run('INSERT INTO compliance_controls (control_id, title, description, status) VALUES (?, ?, ?, ?)', 
        ['AC-1', 'Access Control Policy', 'Documented policy for user access.', 'Compliant']);
    }

    console.log("SQLite Database & Tables Ready!");
    return db;
}

module.exports = setupDb;
