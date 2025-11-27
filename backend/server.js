const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hrms_db',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// Test DB connection
pool.connect()
  .then(client => {
    client.release();
    console.log('✅ Connected to PostgreSQL');
  })
  .catch(err => {
    console.error('❌ DB Connection Error:', err.message || err);
  });

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running!' });
});

// Get all employees
app.get('/api/employees', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM employees ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({ error: 'Database query error' });
  }
});

// Get single employee
app.get('/api/employees/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query('SELECT * FROM employees WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Employee not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({ error: 'Database query error' });
  }
});

// Create employee
app.post('/api/employees', async (req, res) => {
  try {
    const {
      emp_code, first_name, last_name, email, phone, gender,
      date_of_birth, date_of_joining, department_id, role_id, status
    } = req.body;
    const result = await pool.query(
      `INSERT INTO employees
       (emp_code, first_name, last_name, email, phone, gender, date_of_birth, date_of_joining, department_id, role_id, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [emp_code, first_name, last_name, email, phone, gender, date_of_birth, date_of_joining, department_id, role_id, status || 'ACTIVE']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({ error: 'Database insert error', detail: err.message });
  }
});

// Update employee
app.put('/api/employees/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const fields = [];
    const values = [];
    let idx = 1;
    for (const key of ['emp_code','first_name','last_name','email','phone','gender','date_of_birth','date_of_joining','department_id','role_id','status']) {
      if (req.body[key] !== undefined) {
        fields.push(`${key} = $${idx}`);
        values.push(req.body[key]);
        idx++;
      }
    }
    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
    values.push(id);
    const sql = `UPDATE employees SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const result = await pool.query(sql, values);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Employee not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Database update error', detail: err.message });
  }
});

// Delete employee
app.delete('/api/employees/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query('DELETE FROM employees WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Employee not found' });
    res.json({ deleted: true, employee: result.rows[0] });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Database delete error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
