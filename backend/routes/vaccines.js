const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all unique vaccines from vaccination drives
router.get('/', async (req, res) => {
  try {
    // Query to fetch distinct vaccine details from vaccination drives
    const vaccineQueryResult = await pool.query(`
      SELECT DISTINCT id AS drive_id, title AS drive_title, vaccine_name AS vaccine_type
      FROM vaccination_drives
    `);

    // Send the response with the fetched vaccine data
    res.json(vaccineQueryResult.rows);
  } catch (error) {
    console.error('Error fetching vaccine data:', error.message);
    res.status(500).json({ error: 'Unable to fetch vaccine data. Please try again later.' });
  }
});

module.exports = router;
