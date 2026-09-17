const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_PATH = path.join(__dirname, 'attendance.db');
const KNOWN_FACES_DIR = path.join(__dirname, 'known_faces');
const UNKNOWN_FACES_DIR = path.join(__dirname, 'unknown_faces');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Ensure directories exist
if (!fs.existsSync(KNOWN_FACES_DIR)) fs.mkdirSync(KNOWN_FACES_DIR);
if (!fs.existsSync(UNKNOWN_FACES_DIR)) fs.mkdirSync(UNKNOWN_FACES_DIR);

// Serve images statically
app.use('/known_faces', express.static(KNOWN_FACES_DIR));
app.use('/unknown_faces', express.static(UNKNOWN_FACES_DIR));

// Configure Multer for Face Registration Uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, KNOWN_FACES_DIR);
    },
    filename: function (req, file, cb) {
        // Safe filename based on the student's name
        const safeName = req.body.name ? req.body.name.replace(/[^a-zA-Z0-9 ]/g, "") : "Unknown";
        // Always save as .jpg for consistency
        cb(null, `${safeName}.jpg`);
    }
});
const upload = multer({ storage: storage });

// Connect to SQLite Database
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) console.error('Error connecting to database', err.message);
    else {
        console.log('Connected to the SQLite database.');
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS attendance_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                date TEXT,
                time TEXT,
                UNIQUE(name, date)
            )`);
            db.run(`CREATE TABLE IF NOT EXISTS security_alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                image_path TEXT,
                timestamp TEXT
            )`);
            db.run(`CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE,
                roll_no TEXT,
                department TEXT,
                registered_at TEXT
            )`);
        });
    }
});

// --- API ROUTES ---

// 1. STATS: Get overview statistics
app.get('/api/stats', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    
    const stats = {
        totalStudents: 0,
        presentToday: 0,
        alertsToday: 0
    };

    db.serialize(() => {
        db.get(`SELECT COUNT(*) as count FROM students`, [], (err, row) => {
            if (!err) stats.totalStudents = row.count;
        });
        db.get(`SELECT COUNT(*) as count FROM attendance_logs WHERE date = ?`, [today], (err, row) => {
            if (!err) stats.presentToday = row.count;
        });
        db.get(`SELECT COUNT(*) as count FROM security_alerts WHERE timestamp LIKE ?`, [`${today}%`], (err, row) => {
            if (!err) stats.alertsToday = row.count;
            res.json(stats); // Send response after last query
        });
    });
});

// 2. STUDENTS: Register new student (Upload photo + DB entry)
app.post('/api/students/register', upload.single('photo'), (req, res) => {
    const { name, roll_no, department } = req.body;
    if (!name || !req.file) return res.status(400).json({ error: "Name and photo are required" });

    const registeredAt = new Date().toISOString().split('T')[0];
    const sql = `INSERT INTO students (name, roll_no, department, registered_at) VALUES (?, ?, ?, ?)`;
    
    db.run(sql, [name, roll_no, department, registeredAt], function(err) {
        if (err) {
            // Usually unique constraint on name
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, message: "Student registered successfully", id: this.lastID });
    });
});

// 3. STUDENTS: Get all registered students
app.get('/api/students', (req, res) => {
    db.all(`SELECT * FROM students ORDER BY name ASC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 4. STUDENTS: Delete student
app.delete('/api/students/:name', (req, res) => {
    const name = req.params.name;
    const sql = `DELETE FROM students WHERE name = ?`;
    
    db.run(sql, [name], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        // Also delete the photo file
        const imagePath = path.join(KNOWN_FACES_DIR, `${name}.jpg`);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
        res.json({ success: true, message: "Student deleted" });
    });
});

// 5. ATTENDANCE: Get today's attendance
app.get('/api/attendance', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const sql = `SELECT * FROM attendance_logs WHERE date = ? ORDER BY time DESC`;
    
    db.all(sql, [today], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 6. ATTENDANCE: Get attendance history (optional date filter)
app.get('/api/attendance/history', (req, res) => {
    const date = req.query.date;
    let sql = `SELECT * FROM attendance_logs ORDER BY date DESC, time DESC LIMIT 100`;
    let params = [];

    if (date) {
        sql = `SELECT * FROM attendance_logs WHERE date = ? ORDER BY time DESC`;
        params = [date];
    }
    
    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 7. ATTENDANCE: Manual Mark Present
app.post('/api/attendance/manual', (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const now = new Date();
    // Offset for local timezone if needed, but simplistic ISO is fine for now
    // Actually, getting local date/time is better for attendance
    const offsetMs = now.getTimezoneOffset() * 60 * 1000;
    const localNow = new Date(now.getTime() - offsetMs);
    const date = localNow.toISOString().split('T')[0];
    const time = localNow.toISOString().split('T')[1].split('.')[0];

    const sql = `INSERT INTO attendance_logs (name, date, time) VALUES (?, ?, ?)`;
    db.run(sql, [name, date, time], function(err) {
        if (err) {
            if(err.message.includes("UNIQUE")) return res.status(400).json({ error: "Already marked present today" });
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, message: "Manually marked present" });
    });
});

// 8. ALERTS: Get recent security alerts
app.get('/api/alerts', (req, res) => {
    const sql = `SELECT * FROM security_alerts ORDER BY timestamp DESC LIMIT 50`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 9. ALERTS: Convert Unknown Face to Registered Student
app.post('/api/alerts/convert', (req, res) => {
    const { alertId, image_path, name, roll_no, department } = req.body;
    if (!name || !image_path) return res.status(400).json({ error: "Name and image_path required" });

    const safeName = name.replace(/[^a-zA-Z0-9 ]/g, "");
    const unknownPath = path.join(UNKNOWN_FACES_DIR, image_path);
    const knownPath = path.join(KNOWN_FACES_DIR, `${safeName}.jpg`);

    if (!fs.existsSync(unknownPath)) {
        return res.status(404).json({ error: "Alert image file not found" });
    }

    // Move file
    fs.renameSync(unknownPath, knownPath);

    // Add to students DB
    const registeredAt = new Date().toISOString().split('T')[0];
    db.run(`INSERT INTO students (name, roll_no, department, registered_at) VALUES (?, ?, ?, ?)`, 
        [safeName, roll_no, department, registeredAt], (err) => {
            if (err) {
                // if DB fails, might want to move file back, but let's keep it simple
                console.error("DB Insert Error during conversion", err);
            }
        });

    // Remove from alerts DB
    db.run(`DELETE FROM security_alerts WHERE id = ?`, [alertId]);

    res.json({ success: true, message: "Unknown face successfully converted to registered student" });
});

// 10. ALERTS: Delete a security alert
app.delete('/api/alerts/:id', (req, res) => {
    const alertId = req.params.id;
    
    // First, find the image path so we can delete the file
    db.get(`SELECT image_path FROM security_alerts WHERE id = ?`, [alertId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Alert not found" });
        
        const imagePath = path.join(UNKNOWN_FACES_DIR, row.image_path);
        
        // Delete file if it exists
        if (fs.existsSync(imagePath)) {
            try {
                fs.unlinkSync(imagePath);
            } catch(e) {
                console.error("Failed to delete alert image file:", e);
            }
        }
        
        // Delete from DB
        db.run(`DELETE FROM security_alerts WHERE id = ?`, [alertId], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: "Alert deleted successfully" });
        });
    });
});

const { exec } = require('child_process');

// 10. SCANNER: Web-based single frame scan
app.post('/api/scan-frame', (req, res) => {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: "Image data required" });

    // The image is base64 encoded "data:image/jpeg;base64,/9j/4AAQ..."
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const tempPath = path.join(__dirname, 'temp_scan.jpg');

    fs.writeFile(tempPath, base64Data, 'base64', (err) => {
        if (err) return res.status(500).json({ error: "Failed to save temp image" });

        // Run python script on the temp file
        exec(`python scan_single.py ${tempPath}`, (error, stdout, stderr) => {
            // Delete temp file after processing
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

            if (error) {
                console.error("Python Error:", stderr || error.message);
                return res.status(500).json({ error: "Failed to run face recognition" });
            }

            try {
                // The python script should print JSON to stdout
                // Sometimes stdout has extra newlines or warnings, grab the last line or parse it directly
                // Filter out any non-JSON logs the python script might accidentally print
                let output = stdout.trim();
                const jsonStart = output.indexOf('[');
                const jsonEnd = output.lastIndexOf(']');
                if (jsonStart !== -1 && jsonEnd !== -1) {
                    output = output.substring(jsonStart, jsonEnd + 1);
                }
                
                const results = JSON.parse(output);
                res.json({ success: true, results });
            } catch (parseErr) {
                console.error("JSON Parse Error:", parseErr, "Output:", stdout);
                res.status(500).json({ error: "Failed to parse face recognition output" });
            }
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
