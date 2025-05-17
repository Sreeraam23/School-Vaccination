// backend/routes/vaccinationDrives.js

const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all vaccination drives
router.get('/', async (req, res) => {
  try {
    const drivesQueryResult = await pool.query('SELECT * FROM vaccination_drives ORDER BY drive_date');
    res.json(drivesQueryResult.rows);
  } catch (error) {
    console.error('Error fetching vaccination drives:', error.message);
    res.status(500).json({ error: 'Unable to fetch vaccination drives. Please try again later.' });
  }
});

// POST a new vaccination drive
router.post('/', async (req, res) => {
  const { title, vaccine_name: vaccineName, drive_date: driveDate, no_of_vaccine: vaccineCount, classname: className } = req.body;

  try {
    // Check if the drive date already exists
    const existingDriveCheck = await pool.query(
      'SELECT 1 FROM vaccination_drives WHERE drive_date = $1',
      [driveDate]
    );

    if (existingDriveCheck.rowCount > 0) {
      return res.status(400).json({ error: 'A vaccination drive is already scheduled for this date. Please choose a different date.' });
    }

    // Insert the new vaccination drive
    const newDriveResult = await pool.query(
      `INSERT INTO vaccination_drives (title, vaccine_name, drive_date, no_of_vaccine, classname)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, vaccineName, driveDate, vaccineCount, className]
    );
    res.status(201).json(newDriveResult.rows[0]);
  } catch (error) {
    console.error('Error creating vaccination drive:', error.message);
    res.status(500).json({ error: 'Unable to create vaccination drive. Please try again later.' });
  }
});

// PUT to update an existing vaccination drive
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, vaccine_name: vaccineName, drive_date: driveDate, no_of_vaccine: vaccineCount, classname: className } = req.body;

  try {
    const updateDriveResult = await pool.query(
      `UPDATE vaccination_drives
       SET title = $1, vaccine_name = $2, drive_date = $3, no_of_vaccine = $4, classname = $5
       WHERE id = $6 RETURNING *`,
      [title, vaccineName, driveDate, vaccineCount, className, id]
    );

    if (updateDriveResult.rowCount === 0) {
      return res.status(404).json({ error: 'Vaccination drive not found. Please check the ID and try again.' });
    }

    res.json(updateDriveResult.rows[0]);
  } catch (error) {
    console.error('Error updating vaccination drive:', error.message);
    res.status(500).json({ error: 'Unable to update vaccination drive. Please try again later.' });
  }
});

module.exports = router;
