// backend/routes/dashboard.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/dashboard/summary
// Fetch dashboard summary including total students, vaccinated students, vaccination rate, and upcoming drives
router.get('/summary', async (req, res) => {
  try {
    // Query to get the total number of students
    const totalStudentsQuery = await pool.query('SELECT COUNT(*) AS total_students FROM students');

    // Query to get the number of vaccinated students
    const vaccinatedStudentsQuery = await pool.query("SELECT COUNT(*) AS vaccinated_students FROM students WHERE vaccination_status = 'Vaccinated'");

    // Query to fetch upcoming vaccination drives within the next 30 days
    const upcomingDrivesQuery = await pool.query(`
      SELECT id AS drive_id, title AS drive_title, TO_CHAR(drive_date, 'YYYY-MM-DD') AS drive_date
      FROM vaccination_drives
      WHERE drive_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '30 days')
      ORDER BY drive_date ASC
    `);

    // Extracting results from queries
    const totalStudents = parseInt(totalStudentsQuery.rows[0].total_students, 10);
    const vaccinatedStudents = parseInt(vaccinatedStudentsQuery.rows[0].vaccinated_students, 10);

    // Calculate vaccination rate
    const vaccinationRate = totalStudents > 0 ? Math.round((vaccinatedStudents / totalStudents) * 100) : 0;

    // Send the response with the summary data
    res.json({
      totalStudents,
      vaccinatedStudents,
      vaccinationRate,
      upcomingDrives: upcomingDrivesQuery.rows,
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error.message);
    res.status(500).json({ error: 'Failed to retrieve dashboard summary. Please try again later.' });
  }
});

module.exports = router;
