const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
// Render will provide the port via an environment variable.
const PORT = process.env.PORT || 3001;

// IMPORTANT: Enable CORS to allow your frontend to communicate with this backend.
// In production, you should restrict the origin to your Vercel frontend URL.
app.use(cors()); 

// A simple middleware to parse JSON request bodies.
app.use(express.json());

// Cloud SQL Connection Configuration
// Ensure you set DB_USER, DB_PASSWORD, DB_NAME, and DB_HOST in your environment variables.
// For Cloud SQL, DB_HOST typically looks like '/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME' for Unix sockets
// or the public/private IP address if using TCP.
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST, // e.g., '/cloudsql/my-project:us-central1:my-instance'
  port: process.env.DB_PORT || 5432, // Default PostgreSQL port
});

// A simple health check endpoint.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running!' });
});

// Example endpoint to fetch employees from Cloud SQL
app.get('/api/employees', async (req, res) => {
  try {
    // This assumes you have created a table named 'employees' in your Cloud SQL database.
    const result = await pool.query('SELECT * FROM employees');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});