import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, TextField, Button,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Snackbar, Chip, Select, MenuItem,
  FormControl, InputLabel, Container, Link, TablePagination, TableSortLabel
} from '@mui/material';
import {
  Add, Edit, CloudUpload,
  Search, CheckCircle
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import axios from 'axios';

// Footer Component
const Footer = () => (
  <Box
    component="footer"
    sx={{
      backgroundColor: (theme) =>
        theme.palette.mode === "light"
          ? theme.palette.grey[200]
          : theme.palette.grey[800],
      p: 3,
      mt: 4,
    }}
  >
    <Container maxWidth="sm">
      <Typography variant="body2" color="text.secondary" align="center">
        {"Developed by School Vaccination Team "}
        <Link>
          School Vaccination Portal
        </Link>{" "}
        {new Date().getFullYear()}
        {"."}
      </Typography>
    </Container>
  </Box>
);

const ManageStudents = () => {
  const [studentList, setStudentList] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [vaccineList, setVaccineList] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Sorting state
  const [sortDirection, setSortDirection] = useState('asc');
  const [sortBy, setSortBy] = useState('name');

  const initialFormState = { 
    name: '', 
    studentId: '', 
    className: '', 
    dob: ''
  };
  const [formState, setFormState] = useState(initialFormState);

  const navigate = useNavigate();

  useEffect(() => {
    fetchStudentList();
    fetchVaccineList();
  }, []);

  const fetchStudentList = async () => {
    try {
      const { data } = await axios.get('http://localhost:3001/api/students');
      setStudentList(data);
    } catch (error) {
      showNotification('Error fetching student list', 'error');
    }
  };

  const fetchVaccineList = async () => {
    try {
      const { data } = await axios.get('http://localhost:3001/api/vaccines');
      setVaccineList(data);
    } catch (error) {
      showNotification('Error fetching vaccine list', 'error');
    }
  };

  const handleSearchInput = (e) => setSearchInput(e.target.value.toLowerCase().trim());

  const filteredStudentList = studentList.filter((student) => {
    const name = student.name?.toLowerCase() || '';
    const classname = student.classname?.toLowerCase() || '';
    const id = String(student.id || '').toLowerCase();
    const vaccinationDetails = student.vaccinations
    ?.map(v => {
      const title = v.title?.toLowerCase() || '';
      const vaccineName = v.vaccineName?.toLowerCase() || '';
      const date = new Date(v.date).toLocaleDateString().toLowerCase();
      return `${title} ${vaccineName} ${date}`;
    })
    .join(' ') || '';
    return (
      name.includes(searchInput) ||
      classname.includes(searchInput) ||
      id.includes(searchInput) ||
      vaccinationDetails.includes(searchInput)
    );
  });

  // Sorting logic
  function descendingComparator(a, b, orderBy) {
    if (!a[orderBy]) return 1;
    if (!b[orderBy]) return -1;
    if (b[orderBy].toLowerCase() < a[orderBy].toLowerCase()) return -1;
    if (b[orderBy].toLowerCase() > a[orderBy].toLowerCase()) return 1;
    return 0;
  }

  function getComparator(order, orderBy) {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }

  const handleSortRequest = () => {
    const isAsc = sortBy === 'name' && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortBy('name');
  };

  // Apply sorting and pagination
  const sortedStudentList = stableSort(filteredStudentList, getComparator(sortDirection, sortBy));
  const paginatedStudentList = sortedStudentList.slice(
    currentPage * rowsPerPage,
    currentPage * rowsPerPage + rowsPerPage
  );

  const handlePageChange = (event, newPage) => setCurrentPage(newPage);

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formState.name,
        classname: formState.className,
        dob: formState.dob
      };

      if (currentStudent) {
        await axios.put(`http://localhost:3001/api/students/${currentStudent.id}`, payload);
        showNotification('Student updated successfully', 'success');
      } else {
        await axios.post('http://localhost:3001/api/students', payload);
        showNotification('Student added successfully', 'success');
      }
      fetchStudentList();
      handleCloseDialog();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Error saving student', 'error');
    }
  };

  const handleBulkUpload = async (acceptedFiles) => {
    try {
      Papa.parse(acceptedFiles[0], {
        header: true,
        transform: (value, column) => {
          if (column === 'dob') {
            const d = new Date(value);
            if (!isNaN(d)) {
              return d.toISOString().slice(0, 10);
            }
          }
          return value;
        },
        complete: async (results) => {
          const { data } = await axios.post(
            'http://localhost:3001/api/students/bulk',
            results.data
          );
          showNotification(`${data.created} students added, ${data.skipped} duplicates skipped`, 'success');
          fetchStudentList();
        }
      });
    } catch (error) {
      showNotification('Error processing CSV file', 'error');
    }
  };

  const showNotification = (message, severity) => setNotification({ open: true, message, severity });

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentStudent(null);
    setFormState(initialFormState);
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Button
        variant="contained"
        color="primary"
        sx={{ mb: 2 }}
        onClick={() => navigate('/Dashboard')}
      >
        Return to Dashboard
      </Button>
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          variant="outlined"
          placeholder="Search students..."
          InputProps={{ startAdornment: <Search /> }}
          sx={{ flexGrow: 1 }}
          onChange={handleSearchInput}
        />
        <Button
          variant="contained"
          size="medium"
          startIcon={<Add />}
          sx={{ minWidth: 160 }}
          onClick={() => setDialogOpen(true)}
        >
          Add Student
        </Button>
        <div {...useDropzone({ accept: '.csv', multiple: false, onDrop: handleBulkUpload }).getRootProps()}>
          <input {...useDropzone({ accept: '.csv', multiple: false, onDrop: handleBulkUpload }).getInputProps()} />
          <Button
            variant="contained"
            size="large"
            startIcon={<CloudUpload />}
            sx={{ minWidth: 160 }}
          >
            Bulk Import
          </Button>
        </div>
      </Box>
      {/* Table and other components */}
      <Footer />
    </Box>
  );
};

export default ManageStudents;
