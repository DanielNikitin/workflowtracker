const sqlite3 = require('sqlite3').verbose();
const dbPath = './db/database.db';

// Create tables if they do not exist
function createTablesIfNotExists(db) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Existing tables
            db.run(`
                CREATE TABLE IF NOT EXISTS Years (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    year INTEGER UNIQUE NOT NULL,
                    is_leap_year BOOLEAN NOT NULL
                );
            `, (err) => {
                if (err) reject(err);
            });

            db.run(`
                CREATE TABLE IF NOT EXISTS Months (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    days_count INTEGER NOT NULL DEFAULT 0
                );
            `, (err) => {
                if (err) reject(err);
            });

            db.run(`
                CREATE TABLE IF NOT EXISTS MonthDays (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    year_id INTEGER NOT NULL,
                    month_id INTEGER NOT NULL,
                    day_number INTEGER NOT NULL,
                    day_name TEXT NOT NULL,
                    days_in_month INTEGER NOT NULL,
                    FOREIGN KEY (year_id) REFERENCES Years(id),
                    FOREIGN KEY (month_id) REFERENCES Months(id)
                );
            `, (err) => {
                if (err) reject(err);
            });

            // New Groups table
            db.run(`
                CREATE TABLE IF NOT EXISTS Groups (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    group_name TEXT UNIQUE NOT NULL
                );
            `, (err) => {
                if (err) reject(err);
            });

            // Modified Logins table to reference Groups
            db.run(`
                CREATE TABLE IF NOT EXISTS Logins (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    login TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    name TEXT NOT NULL,
                    group_id INTEGER NOT NULL,
                    FOREIGN KEY (group_id) REFERENCES Groups(id)
                );
            `, (err) => {
                if (err) reject(err);
            });

            // New WorkRecords table
            db.run(`
                CREATE TABLE IF NOT EXISTS WorkRecords (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    start_time TEXT NOT NULL,
                    end_time TEXT NOT NULL,
                    start_date TEXT NOT NULL,
                    end_date TEXT NOT NULL,
                    work_type TEXT NOT NULL,
                    additional_info TEXT,
                    FOREIGN KEY (user_id) REFERENCES Logins(id)
                );
            `, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });
}

// Function to insert sample data into Groups and Logins table (optional)
function insertSampleData(db) {
    const groupStmt = db.prepare(`
        INSERT OR IGNORE INTO Groups (group_name) VALUES (?);
    `);

    // Insert sample groups
    const groups = ['Admin', 'User', 'Manager', 'Director'];
    groups.forEach(group => {
        groupStmt.run(group);
    });

    groupStmt.finalize();

    // Insert sample logins
    const loginStmt = db.prepare(`
        INSERT OR IGNORE INTO Logins (login, password, name, group_id) VALUES (?, ?, ?, (SELECT id FROM Groups WHERE group_name = ?));
    `);

    loginStmt.run('danieln', '1', 'Daniel', 'User');
    loginStmt.run('dmitrin', '1', 'Dmitri', 'Manager');

    loginStmt.finalize();
}

// Main function to execute the script
async function main() {
    const db = new sqlite3.Database(dbPath, async (err) => {
        if (err) {
            console.error('Database connection error:', err.message);
            return;
        }
        console.log('Connected to the database.');

        try {
            // Create tables if they do not exist
            await createTablesIfNotExists(db);

            // Insert sample data (optional)
            insertSampleData(db);

            // Close database connection
            db.close((err) => {
                if (err) {
                    console.error('Database closing error:', err.message);
                }
                console.log('Disconnected from the database.');
            });
        } catch (error) {
            console.error('Error:', error.message);
        }
    });
}

main();

// node src/generateyear.js
