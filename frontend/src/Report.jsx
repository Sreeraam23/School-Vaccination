import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, TextField, TableSortLabel, TablePagination,
  Button, Grid, Box, Container, Typography, Link
} from '@mui/material';
import { CSVLink } from 'react-csv';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';
import dayjs from 'dayjs';

// Footer Component
const Footer = () => (
  <Box
    component="footer"
    sx={{
      position: "fixed",
      left: 0,
      bottom: 0,
      width: "100%",
      backgroundColor: (theme) =>
        theme.palette.mode === "light"
          ? theme.palette.grey[200]
          : theme.palette.grey[800],
      p: 3,
      zIndex: 1300,
    }}
  >
    <Container maxWidth="sm">
      <Typography variant="body2" color="text.secondary" align="center">
        {"Developed by School Vaccination Team "}
        School Vaccination Portal {new Date().getFullYear()}.
      </Typography>
    </Container>
  </Box>
);

// Main Report Component
const VaccinationReport = () => {
  // State for fetched data and UI controls
  const [reportData, setReportData] = useState([]);
  const [filterCriteria, setFilterCriteria] = useState({
    studentName: '',
    vaccineName: '',
    className: '',
    driveDate: ''
  });
  const [sortColumn, setSortColumn] = useState('name'); // Column to sort by
  const [sortDirection, setSortDirection] = useState('asc'); // Sort direction
  const [currentPage, setCurrentPage] = useState(0); // Current table page
  const [rowsPerPage, setRowsPerPage] = useState(5); // Rows per page

  const navigate = useNavigate();
  const reportRef = useRef(); // Reference for exporting to PDF

  // Format date strings
  const formatDate = (dateString) => {
    return dateString ? dayjs(dateString).format('YYYY-MM-DD') : '';
  };

  // Fetch data from API whenever filters change
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/report/stdsvlvd', {
          params: {
            student_name: filterCriteria.studentName,
            vaccine_name: filterCriteria.vaccineName,
            classname: filterCriteria.className,
            drive_date: filterCriteria.driveDate,
          }
        });
        setReportData(response.data);
      } catch (error) {
        console.error('❌ Error fetching report data:', error.message);
      }
    };

    fetchReportData();
  }, [filterCriteria]);

  // Handle filter input changes
  const handleFilterChange = (e) => {
    setFilterCriteria({ ...filterCriteria, [e.target.name]: e.target.value });
  };

  // Filter data based on filter state
  const filteredReportData = reportData.filter(item => {
    return (!filterCriteria.studentName || item.name?.toLowerCase().includes(filterCriteria.studentName.toLowerCase())) &&
           (!filterCriteria.vaccineName || item.vaccine_name?.toLowerCase().includes(filterCriteria.vaccineName.toLowerCase())) &&
           (!filterCriteria.className || item.student_class?.toLowerCase().includes(filterCriteria.className.toLowerCase())) &&
           (!filterCriteria.driveDate || formatDate(item.drive_date) === filterCriteria.driveDate);
  });

  // Handle sorting logic for table columns
  const handleSort = (column) => {
    const isAsc = sortColumn === column && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortColumn(column);
  };

  // Sort filtered data based on selected column and order
  const sortedReportData = [...filteredReportData].sort((a, b) => {
    const valA = a[sortColumn];
    const valB = b[sortColumn];
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Export filtered data to Excel file
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredReportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vaccination Report');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buffer]), 'Vaccination_Report.xlsx');
  };

  // Export visible report section to PDF
  const exportToPDF = () => {
    const element = reportRef.current;
    const options = {
      margin: 0.5,
      filename: 'Vaccination_Report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(options).from(element).save();
  };

  return (
    <Box sx={{ p: 3, paddingBottom: '100px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Button to return to Dashboard */}
      <Button
        variant="contained"
        color="primary"
        sx={{ mb: 2 }}
        onClick={() => navigate('/Dashboard')}
      >
        Return to Dashboard
      </Button>

      <Paper sx={{ padding: 2 }}>
        <div ref={reportRef}>
          {/* Report Title */}
          <Typography variant="h4" gutterBottom>
            Student Vaccination Report
          </Typography>

          {/* Filter Inputs */}
          <Grid container spacing={2} sx={{ marginBottom: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                name="studentName"
                label="Student Name"
                variant="outlined"
                value={filterCriteria.studentName}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                name="vaccineName"
                label="Vaccine Name"
                variant="outlined"
                value={filterCriteria.vaccineName}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                name="className"
                label="Class"
                variant="outlined"
                value={filterCriteria.className}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                name="driveDate"
                label="Drive Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                value={filterCriteria.driveDate}
                onChange={handleFilterChange}
              />
            </Grid>
          </Grid>

          {/* Export Buttons */}
          <Grid container spacing={2} sx={{ marginBottom: 2 }}>
            <Grid item>
              <CSVLink data={filteredReportData} filename="Vaccination_Report.csv" style={{ textDecoration: 'none' }}>
                <Button variant="contained" color="primary">Download CSV</Button>
              </CSVLink>
            </Grid>
            <Grid item>
              <Button variant="contained" color="primary" onClick={exportToExcel}>Download Excel</Button>
            </Grid>
            <Grid item>
              <Button variant="contained" color="primary" onClick={exportToPDF}>Download PDF</Button>
            </Grid>
          </Grid>

          {/* Data Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {['name', 'student_class', 'vaccination_status', 'vaccine_name', 'drive_date'].map((col) => (
                    <TableCell key={col}>
                      <TableSortLabel
                        active={sortColumn === col}
                        direction={sortColumn === col ? sortDirection : 'asc'}
                        onClick={() => handleSort(col)}
                      >
                        {col.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedReportData.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage).map((row, i) => (
                  <TableRow key={i}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.student_class}</TableCell>
                    <TableCell>{row.vaccination_status}</TableCell>
                    <TableCell>{row.vaccine_name}</TableCell>
                    <TableCell>{formatDate(row.drive_date)}</TableCell>
                  </TableRow>
                ))}
                {/* Show message if no records found */}
                {sortedReportData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No matching records found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination Controls */}
          <TablePagination
            component="div"
            count={sortedReportData.length}
            page={currentPage}
            onPageChange={(e, newPage) => setCurrentPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setCurrentPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </div>
      </Paper>

      {/* Fixed Footer */}
      <Footer />
    </Box>
  );
};

export default VaccinationReport;
