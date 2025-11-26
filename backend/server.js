const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
// Render/GCP will provide the port via an environment variable.
const PORT = process.env.PORT || 3001;

// Enable CORS to allow your frontend to communicate with this backend.
const allowedOrigins = [
  process.env.FRONTEND_URL, 
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow all origins for easier testing in preview environments
    return callback(null, true);
  }
}));

app.use(express.json());

// Database Connection Configuration
// We use the EXTERNAL URL as fallback so you can run this locally on your machine.
// On Render, process.env.DATABASE_URL will be used automatically (which is Internal/Fast).
const EXTERNAL_DB_URL = 'postgresql://smart_hr_db_user:z1KPY6GFOAKkyBl6SOXDSLzDyFJCGSKG@dpg-d4j7ct7gi27c739gf8f0-a.oregon-postgres.render.com/smart_hr_db';

let dbConfig;

const connectionString = process.env.DATABASE_URL || EXTERNAL_DB_URL;

if (connectionString) {
  dbConfig = {
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false // Required for Render's self-signed certificates
    }
  };
} else {
  dbConfig = {
    user: process.env.DB_USER = 'smart_hr_db_user',
    password: process.env.DB_PASSWORD = 'z1KPY6GFOAKkyBl6SOXDSLzDyFJCGSKG',
    database: process.env.DB_NAME = 'smart_hr_db',
    host: process.env.DB_HOST = 'dpg-d4j7ct7gi27c739gf8f0-a', 
    port: process.env.DB_PORT || 5432,
  };
}

const pool = new Pool(dbConfig);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running!', platform: process.env.RENDER ? 'Render' : 'Generic' });
});

// Example endpoint
app.get('/api/employees', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM employees');
    res.json(result.rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database query error', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});