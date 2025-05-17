const express = require('express');
const router = express.Router();
const pool = require('../db');

// Helper: Validate yyyy-mm-dd date format
function validateDate(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

// Fetch all students with their vaccination details
router.get('/', async (req, res) => {
  try {
    // Fetch all students
    const studentData = await pool.query('SELECT * FROM students');

    // Fetch vaccination records linked to students
    const vaccinationData = await pool.query(`
      SELECT
        svl.student_id,
        vd.id AS drive_id,
        vd.title AS drive_title,
        vd.vaccine_name AS vaccine_type,
        vd.drive_date AS vaccination_date
      FROM
        student_vaccine_link svl
      JOIN vaccination_drives vd ON svl.vaccination_drive_id = vd.id
    `);

    // Map vaccinations to students
    const vaccinationMap = {};
    vaccinationData.rows.forEach(record => {
      if (!vaccinationMap[record.student_id]) vaccinationMap[record.student_id] = [];
      vaccinationMap[record.student_id].push({
        driveId: record.drive_id,
        title: record.drive_title,
        vaccineName: record.vaccine_type,
        date: record.vaccination_date,
      });
    });

    // Attach vaccination details to students
    const studentList = studentData.rows.map(student => ({
      ...student,
      vaccinations: vaccinationMap[student.id] || [],
    }));

    res.json(studentList);
  } catch (error) {
    console.error('Error fetching students with vaccination details:', error.message);
    res.status(500).send('Failed to fetch students');
  }
});

// Add a new student
router.post('/', async (req, res) => {
  const { name, classname, dob } = req.body;

  if (!dob || !validateDate(dob)) {
    return res.status(400).json({ error: 'Invalid date format. Use yyyy-mm-dd' });
  }

  try {
    await pool.query(
      'INSERT INTO students (name, classname, dob) VALUES ($1, $2, $3)',
      [name, classname, dob]
    );
    res.status(201).send('Student added successfully');
  } catch (error) {
    console.error('Error adding student:', error.message);
    res.status(500).send('Failed to add student');
  }
});

// Update student details
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, classname, dob } = req.body;

  if (!dob || !validateDate(dob)) {
    return res.status(400).json({ error: 'Invalid date format. Use yyyy-mm-dd' });
  }

  try {
    await pool.query(
      'UPDATE students SET name=$1, classname=$2, dob=$3 WHERE id=$4',
      [name, classname, dob, id]
    );
    res.status(200).send('Student updated successfully');
  } catch (error) {
    console.error('Error updating student:', error.message);
    res.status(500).send('Failed to update student');
  }
});

// Bulk import students
router.post('/bulk', async (req, res) => {
  const studentList = req.body;
  let addedCount = 0, skippedCount = 0;

  for (const student of studentList) {
    if (!student.dob || !validateDate(student.dob)) {
      skippedCount++;
      continue;
    }

    try {
      // Check for duplicate entries
      const duplicateCheck = await pool.query(
        'SELECT * FROM students WHERE name = $1 AND classname = $2 AND dob = $3',
        [student.name, student.classname, student.dob]
      );

      if (duplicateCheck.rows.length > 0) {
        skippedCount++;
        continue;
      }

      await pool.query(
        'INSERT INTO students (name, classname, dob) VALUES ($1, $2, $3)',
        [student.name, student.classname, student.dob]
      );
      addedCount++;
    } catch (error) {
      console.error('Error during bulk import:', error.message);
      skippedCount++;
    }
  }

  res.json({ added: addedCount, skipped: skippedCount });
});

// Record student vaccination
router.post('/:id/vaccinate', async (req, res) => {
  const studentId = req.params.id;
  const { vaccinationDriveId } = req.body;

  if (!vaccinationDriveId) {
    return res.status(400).json({ error: 'Vaccination drive ID is required' });
  }

  try {
    // Check if the student is already vaccinated in the drive
    const existingRecord = await pool.query(
      'SELECT * FROM student_vaccine_link WHERE student_id = $1 AND vaccination_drive_id = $2',
      [studentId, vaccinationDriveId]
    );

    if (existingRecord.rows.length > 0) {
      return res.status(400).json({ message: 'Student already vaccinated in this drive' });
    }

    await pool.query(
      'INSERT INTO student_vaccine_link (student_id, vaccination_drive_id) VALUES ($1, $2)',
      [studentId, vaccinationDriveId]
    );

    res.status(201).send('Vaccination recorded successfully');
  } catch (error) {
    console.error('Error recording vaccination:', error.message);
    res.status(500).send('Failed to record vaccination');
  }
});

// Update vaccination status
router.put('/vaccination-status/:id', async (req, res) => {
  const { id } = req.params;
  const { vaccinationStatus } = req.body;

  if (!vaccinationStatus) {
    return res.status(400).json({ error: 'Vaccination status is required' });
  }

  try {
    await pool.query(
      'UPDATE students SET vaccination_status = $1 WHERE id = $2',
      [vaccinationStatus, id]
    );
    res.status(200).send('Vaccination status updated successfully');
  } catch (error) {
    console.error('Error updating vaccination status:', error.message);
    res.status(500).send('Failed to update vaccination status');
  }
});

module.exports = router;
