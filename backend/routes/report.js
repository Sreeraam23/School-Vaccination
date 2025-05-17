const express = require('express');
const router = express.Router();
const pool = require('../db');

// Endpoint to fetch a detailed vaccination report with optional filters
router.get('/student-vaccination-report', async (req, res) => {
    try {
        const { student_name: studentNameFilter, vaccine_name: vaccineNameFilter, classname: classFilter, drive_date: driveDateFilter } = req.query;

        let sqlQuery = `
            SELECT 
                s.name AS student_name,
                s.vaccination_status AS vaccination_status,
                s.classname AS student_class,
                s.dob AS date_of_birth,
                v.title AS vaccination_drive_title,
                v.drive_date AS vaccination_date,
                v.vaccine_name AS vaccine_name,
                v.no_of_vaccine AS vaccine_quantity,
                v.classname AS drive_class
            FROM students s
            LEFT JOIN student_vaccine_link svl 
                ON s.id = svl.student_id
            LEFT JOIN vaccination_drives v 
                ON v.id = svl.vaccination_drive_id
            WHERE 1=1
        `;

        const queryParams = [];
        let queryIndex = 1;

        // Apply filters based on query parameters
        if (studentNameFilter) {
            sqlQuery += ` AND s.name ILIKE $${queryIndex++}`;
            queryParams.push(`%${studentNameFilter}%`);
        }

        if (vaccineNameFilter) {
            sqlQuery += ` AND v.vaccine_name ILIKE $${queryIndex++}`;
            queryParams.push(`%${vaccineNameFilter}%`);
        }

        if (classFilter) {
            sqlQuery += ` AND s.classname ILIKE $${queryIndex++}`;
            queryParams.push(`%${classFilter}%`);
        }

        if (driveDateFilter) {
            sqlQuery += ` AND v.drive_date = $${queryIndex++}`;
            queryParams.push(driveDateFilter);
        }

        const { rows: reportData } = await pool.query(sqlQuery, queryParams);
        res.json(reportData);
    } catch (error) {
        console.error('Error fetching vaccination report:', error.message);
        res.status(500).json({ error: 'Failed to retrieve vaccination report. Please try again later.' });
    }
});

// Endpoint to fetch a list of vaccination drives
router.get('/vaccination-drives', async (req, res) => {
    try {
        const { rows: vaccinationDrives } = await pool.query(`
            SELECT 
                title AS drive_title,
                drive_date AS vaccination_date,
                vaccine_name AS vaccine_name,
                no_of_vaccine AS vaccine_quantity,
                classname AS drive_class
            FROM vaccination_drives
            ORDER BY drive_date DESC
        `);
        res.json(vaccinationDrives);
    } catch (error) {
        console.error('Error fetching vaccination drives:', error.message);
        res.status(500).json({ error: 'Failed to retrieve vaccination drives. Please try again later.' });
    }
});

// Endpoint to fetch a list of students with their vaccination status
router.get('/students', async (req, res) => {
    try {
        const { rows: studentData } = await pool.query(`
            SELECT 
                name AS student_name,
                vaccination_status AS vaccination_status,
                classname AS student_class,
                dob AS date_of_birth
            FROM students
            ORDER BY name ASC
        `);
        res.json(studentData);
    } catch (error) {
        console.error('Error fetching student list:', error.message);
        res.status(500).json({ error: 'Failed to retrieve student list. Please try again later.' });
    }
});

module.exports = router;
