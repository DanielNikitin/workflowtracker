const sqlite3 = require('sqlite3').verbose();
const dbPath = './src/db/database.db';

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

            // New Logins table
            db.run(`
                CREATE TABLE IF NOT EXISTS Logins (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    login TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    name TEXT NOT NULL,
                    position TEXT NOT NULL
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

// Function to insert sample data into Logins table (optional)
function insertSampleLogins(db) {
    const stmt = db.prepare(`
        INSERT OR IGNORE INTO Logins (login, password, name, position) VALUES (?, ?, ?, ?);
    `);

    stmt.run('admin', 'password123', 'Admin User', 'Administrator');
    stmt.run('user', 'userpassword', 'Regular User', 'User');

    stmt.finalize();
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
            insertSampleLogins(db);

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