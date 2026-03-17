import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('medical.db');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT,
    blood_type TEXT,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS chronic_conditions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    condition_name TEXT NOT NULL,
    diagnosis_date DATE,
    status TEXT DEFAULT 'active',
    notes TEXT,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
  );

  CREATE TABLE IF NOT EXISTS consultations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    consultation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason_for_visit TEXT,
    subjective TEXT,
    objective TEXT,
    assessment TEXT,
    plan TEXT,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
  );

  CREATE TABLE IF NOT EXISTS medications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    medication_name TEXT NOT NULL,
    dosage TEXT,
    frequency TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'active',
    FOREIGN KEY (patient_id) REFERENCES patients(id)
  );

  CREATE TABLE IF NOT EXISTS lab_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    test_name TEXT NOT NULL,
    value TEXT NOT NULL,
    unit TEXT,
    reference_range TEXT,
    test_date DATE NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status TEXT DEFAULT 'scheduled',
    type TEXT DEFAULT 'presencial',
    notes TEXT,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
  );
`);

// Seed data if empty
const patientCount = db.prepare('SELECT COUNT(*) as count FROM patients').get() as { count: number };
if (patientCount.count === 0) {
  const insertPatient = db.prepare('INSERT INTO patients (first_name, last_name, date_of_birth, gender, blood_type, email) VALUES (?, ?, ?, ?, ?, ?)');
  const result = insertPatient.run('Juan', 'Pérez', '1965-05-15', 'M', 'O+', 'juan.perez@example.com');
  const patientId = result.lastInsertRowid;

  db.prepare('INSERT INTO chronic_conditions (patient_id, condition_name, diagnosis_date, notes) VALUES (?, ?, ?, ?)').run(
    patientId, 'Diabetes Mellitus Tipo 2', '2015-10-20', 'Controlado con metformina'
  );
  db.prepare('INSERT INTO chronic_conditions (patient_id, condition_name, diagnosis_date, notes) VALUES (?, ?, ?, ?)').run(
    patientId, 'Hipertensión Arterial', '2018-03-12', 'Uso de Enalapril'
  );

  db.prepare('INSERT INTO medications (patient_id, medication_name, dosage, frequency, start_date) VALUES (?, ?, ?, ?, ?)').run(
    patientId, 'Metformina', '850mg', 'Cada 12 horas', '2015-10-20'
  );
  db.prepare('INSERT INTO medications (patient_id, medication_name, dosage, frequency, start_date) VALUES (?, ?, ?, ?, ?)').run(
    patientId, 'Enalapril', '10mg', 'Cada 24 horas', '2018-03-12'
  );

  db.prepare('INSERT INTO lab_results (patient_id, test_name, value, unit, reference_range, test_date) VALUES (?, ?, ?, ?, ?, ?)').run(
    patientId, 'HbA1c', '6.8', '%', '4.0-5.6', '2024-01-15'
  );
  db.prepare('INSERT INTO lab_results (patient_id, test_name, value, unit, reference_range, test_date) VALUES (?, ?, ?, ?, ?, ?)').run(
    patientId, 'Creatinina', '1.1', 'mg/dL', '0.7-1.3', '2024-01-15'
  );
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get('/api/patients', (req, res) => {
    const patients = db.prepare('SELECT * FROM patients ORDER BY last_name ASC').all();
    res.json(patients);
  });

  app.post('/api/patients', (req, res) => {
    const { first_name, last_name, date_of_birth, gender, blood_type, email, phone } = req.body;
    const stmt = db.prepare('INSERT INTO patients (first_name, last_name, date_of_birth, gender, blood_type, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const result = stmt.run(first_name, last_name, date_of_birth, gender, blood_type, email, phone);
    res.json({ id: result.lastInsertRowid });
  });

  app.get('/api/patients/:id', (req, res) => {
    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    
    const conditions = db.prepare('SELECT * FROM chronic_conditions WHERE patient_id = ?').all(req.params.id);
    const medications = db.prepare('SELECT * FROM medications WHERE patient_id = ?').all(req.params.id);
    const consultations = db.prepare('SELECT * FROM consultations WHERE patient_id = ? ORDER BY consultation_date DESC').all(req.params.id);
    const labs = db.prepare('SELECT * FROM lab_results WHERE patient_id = ? ORDER BY test_date DESC').all(req.params.id);

    res.json({ ...patient, conditions, medications, consultations, labs });
  });

  app.post('/api/consultations', (req, res) => {
    const { patient_id, reason_for_visit, subjective, objective, assessment, plan } = req.body;
    const stmt = db.prepare('INSERT INTO consultations (patient_id, reason_for_visit, subjective, objective, assessment, plan) VALUES (?, ?, ?, ?, ?, ?)');
    const result = stmt.run(patient_id, reason_for_visit, subjective, objective, assessment, plan);
    res.json({ id: result.lastInsertRowid });
  });

  app.post('/api/conditions', (req, res) => {
    const { patient_id, condition_name, diagnosis_date, notes, status } = req.body;
    const stmt = db.prepare('INSERT INTO chronic_conditions (patient_id, condition_name, diagnosis_date, notes, status) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(patient_id, condition_name, diagnosis_date, notes, status || 'active');
    res.json({ id: result.lastInsertRowid });
  });

  app.post('/api/medications', (req, res) => {
    const { patient_id, medication_name, dosage, frequency, start_date, status } = req.body;
    const stmt = db.prepare('INSERT INTO medications (patient_id, medication_name, dosage, frequency, start_date, status) VALUES (?, ?, ?, ?, ?, ?)');
    const result = stmt.run(patient_id, medication_name, dosage, frequency, start_date, status || 'active');
    res.json({ id: result.lastInsertRowid });
  });

  app.post('/api/labs', (req, res) => {
    const { patient_id, test_name, value, unit, reference_range, test_date } = req.body;
    const stmt = db.prepare('INSERT INTO lab_results (patient_id, test_name, value, unit, reference_range, test_date) VALUES (?, ?, ?, ?, ?, ?)');
    const result = stmt.run(patient_id, test_name, value, unit, reference_range, test_date);
    res.json({ id: result.lastInsertRowid });
  });

  app.delete('/api/patients/:id', (req, res) => {
    // Cascade delete manually since we didn't set it in schema
    db.prepare('DELETE FROM chronic_conditions WHERE patient_id = ?').run(req.params.id);
    db.prepare('DELETE FROM medications WHERE patient_id = ?').run(req.params.id);
    db.prepare('DELETE FROM consultations WHERE patient_id = ?').run(req.params.id);
    db.prepare('DELETE FROM lab_results WHERE patient_id = ?').run(req.params.id);
    db.prepare('DELETE FROM appointments WHERE patient_id = ?').run(req.params.id);
    db.prepare('DELETE FROM patients WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.get('/api/appointments', (req, res) => {
    const appointments = db.prepare(`
      SELECT a.*, p.first_name, p.last_name 
      FROM appointments a 
      JOIN patients p ON a.patient_id = p.id 
      ORDER BY a.start_time ASC
    `).all();
    res.json(appointments);
  });

  app.post('/api/appointments', (req, res) => {
    const { patient_id, start_time, end_time, type, notes } = req.body;
    const stmt = db.prepare('INSERT INTO appointments (patient_id, start_time, end_time, type, notes) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(patient_id, start_time, end_time, type, notes);
    res.json({ id: result.lastInsertRowid });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(3000, '0.0.0.0', () => {
    console.log('Server running on http://localhost:3000');
  });
}

startServer();
