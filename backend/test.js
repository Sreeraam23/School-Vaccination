// backend/testDbConnection.js

const { Pool } = require('pg'); // Import PostgreSQL client

// Configure the database connection pool
const dbConnectionPool = new Pool({
  user: 'school_user',  // PostgreSQL username
  host: 'localhost',    // Database host
  database: 'school_vaccine_db', // Database name
  password: 'school_pass', // PostgreSQL password
  port: 5432,           // Default PostgreSQL port
});

// Function to test the database connection
async function verifyDbConnection() {
  try {
    const result = await dbConnectionPool.query('SELECT NOW()'); // Test query to check connection
    console.log('✅ Database connection successful. Current time:', result.rows[0].now); // Logs the current timestamp
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error.message); // Logs the error message
  } finally {
    dbConnectionPool.end(); // Close the connection pool
  }
}

// Execute the connection test
verifyDbConnection();
