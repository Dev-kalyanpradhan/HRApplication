const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
// Render/GCP will provide the port via an environment variable.
const PORT = process.env.PORT || 3001;

// Enable CORS to allow your frontend to communicate with this backend.
// In production, strictly set this to your Vercel frontend URL.
const allowedOrigins = [
  process.env.FRONTEND_URL, // e.g., https://your-app.vercel.app
  'http://localhost:5173',  // Local Vite dev server
  'http://localhost:3000'   // Alternative local port
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1 && !process.env.ALLOW_ALL_ORIGINS) {
      // For testing phase, you might want to allow all, but secure it later
      // return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
      return callback(null, true); // Temporary: Allow all for easier testing
    }
    return callback(null, true);
  }
}));

app.use(express.json());

// Database Connection Configuration
// Specific Internal Database URL provided by user
const INTERNAL_DB_URL = 'postgresql://smart_hr_db_user:z1KPY6GFOAKkyBl6SOXDSLzDyFJCGSKG@dpg-d4j7ct7gi27c739gf8f0-a/smart_hr_db';

let dbConfig;

// Prioritize env var, fall back to hardcoded internal URL
const connectionString = process.env.DATABASE_URL || INTERNAL_DB_URL;

if (connectionString) {
  // Render / Heroku style connection string
  dbConfig = {
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false // Required for Render's self-signed certificates
    }
  };
} else {
  // Google Cloud SQL / Local style
  dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST, // e.g., '/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME'
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
    // Ensure the 'employees' table exists in your Postgres DB before calling this
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