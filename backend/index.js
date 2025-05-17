// backend/index.js

// Main entry point for the backend server

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware setup
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse incoming JSON requests

// Import route handlers
const dashboardRouter = require('./routes/dashboard');
const studentsRouter = require('./routes/students');
const vaccinesRouter = require('./routes/vaccines');
const vaccinationDrivesRouter = require('./routes/vaccinationDrives');
const reportRouter = require('./routes/report');

// Register API routes
app.use('/api/dashboard', dashboardRouter);
app.use('/api/students', studentsRouter);
app.use('/api/vaccines', vaccinesRouter);
app.use('/api/vaccination-drives', vaccinationDrivesRouter);
app.use('/api/report', reportRouter);

// Start the server
const SERVER_PORT = process.env.PORT || 3001;
app.listen(SERVER_PORT, () => {
  console.log(`✅ Server is up and running at http://localhost:${SERVER_PORT}`);
});
