// backend/db.js
// Database connection configuration using PostgreSQL
const { Pool } = require('pg');
require('dotenv').config();

// Create a new pool instance for database connections
const dbPool = new Pool({
  host: process.env.DB_HOST,       // Database host
  port: process.env.DB_PORT,       // Database port
  user: process.env.DB_USER,       // Database username
  password: process.env.DB_PASSWORD, // Database password
  database: process.env.DB_NAME    // Database name
});

// Export the pool instance for use in other modules
module.exports = dbPool;
