const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'absensi.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize schema
function initializeDatabase() {
  const schema = `
    -- Students Table
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      class_name TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      nfc_uid TEXT UNIQUE,
      face_embedding TEXT,
      photo_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Teachers Table
    CREATE TABLE IF NOT EXISTS teachers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      nfc_uid TEXT UNIQUE,
      face_embedding TEXT,
      photo_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Attendance Logs Table
    CREATE TABLE IF NOT EXISTS attendance_logs (
      id TEXT PRIMARY KEY,
      person_id TEXT NOT NULL,
      person_role TEXT NOT NULL,
      person_name TEXT NOT NULL,
      status TEXT NOT NULL,
      attendance_date DATE NOT NULL,
      attendance_time TIME NOT NULL,
      source TEXT NOT NULL,
      scan_method TEXT,
      confidence REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Face Templates Table (for storing face embeddings)
    CREATE TABLE IF NOT EXISTS face_templates (
      id TEXT PRIMARY KEY,
      person_id TEXT NOT NULL,
      person_role TEXT NOT NULL,
      name TEXT NOT NULL,
      embedding TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Admin Users Table
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'superadmin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- NFC Registrations Table
    CREATE TABLE IF NOT EXISTS nfc_registrations (
      id TEXT PRIMARY KEY,
      person_id TEXT NOT NULL,
      person_role TEXT NOT NULL,
      nfc_uid TEXT UNIQUE NOT NULL,
      registered_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for faster lookups
    CREATE INDEX IF NOT EXISTS idx_students_nfc_uid ON students(nfc_uid);
    CREATE INDEX IF NOT EXISTS idx_teachers_nfc_uid ON teachers(nfc_uid);
    CREATE INDEX IF NOT EXISTS idx_attendance_logs_date ON attendance_logs(attendance_date);
    CREATE INDEX IF NOT EXISTS idx_attendance_logs_person ON attendance_logs(person_id, person_role);
    CREATE INDEX IF NOT EXISTS idx_nfc_registrations_uid ON nfc_registrations(nfc_uid);
  `;

  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  statements.forEach(stmt => {
    db.exec(stmt);
  });

  console.log('✅ Database schema initialized');
}

// Seed initial data
function seedInitialData() {
  try {
    // Check if data already exists
    const studentsCount = db.prepare('SELECT COUNT(*) as count FROM students').get().count;
    
    if (studentsCount > 0) {
      console.log('✅ Database already seeded, skipping...');
      return;
    }

    // Insert students
    const insertStudent = db.prepare(`
      INSERT INTO students (id, name, class_name, status)
      VALUES (?, ?, ?, 'active')
    `);

    const students = [
      ['S-101', 'Ahmad Fauzi', 'X-A'],
      ['S-102', 'Siti Aisyah', 'X-A'],
      ['S-103', 'Rizki Pratama', 'XI-B'],
      ['S-104', 'Nadia Putri', 'XI-B'],
      ['S-105', 'Iqbal Hidayat', 'XII-C']
    ];

    students.forEach(student => {
      insertStudent.run(...student);
    });

    // Insert teachers
    const insertTeacher = db.prepare(`
      INSERT INTO teachers (id, name, subject, status)
      VALUES (?, ?, ?, 'active')
    `);

    const teachers = [
      ['G-201', 'Ustadz Rahmat', 'Pendidikan Agama'],
      ['G-202', 'Ibu Aulia', 'Bahasa Indonesia'],
      ['G-203', 'Ustadz Fikri', 'Matematika']
    ];

    teachers.forEach(teacher => {
      insertTeacher.run(...teacher);
    });

    console.log('✅ Initial data seeded successfully');
  } catch (error) {
    console.error('Error seeding data:', error.message);
  }
}

// Initialize on module load
initializeDatabase();
seedInitialData();

module.exports = db;
