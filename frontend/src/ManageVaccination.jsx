import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Container,
  Snackbar,
} from '@mui/material';
import dayjs from 'dayjs';
import axios from 'axios';

// Footer Component
const Footer = () => (
  <Box
    component="footer"
    sx={{
      backgroundColor: (theme) =>
        theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[800],
      p: 3,
      mt: 4,
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

const ManageVaccination = () => {
  const [vaccinationDrives, setVaccinationDrives] = useState([]);
  const [formState, setFormState] = useState({
    driveTitle: '',
    vaccineName: '',
    driveDate: '',
    vaccineCount: '',
    applicableClass: '',
  });
  const [editDriveIndex, setEditDriveIndex] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const today = dayjs();
  const navigate = useNavigate();

  // Fetch vaccination drives from the API
  useEffect(() => {
    axios
      .get('http://localhost:3001/api/vaccination-drives')
      .then((response) => {
        setVaccinationDrives(response.data);
      })
      .catch((error) => {
        console.error('❌ Error fetching vaccination drives:', error.message);
        setNotification({ open: true, message: 'Failed to load vaccination drives.', severity: 'error' });
      });
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  // Validate the drive date
  const isValidDriveDate = (date) => {
    const selectedDate = dayjs(date);
    return selectedDate.isAfter(today.add(15, 'day'));
  };

  // Check for conflicting drive dates
  const hasDateConflict = (date) => {
    return vaccinationDrives.some((drive, index) => index !== editDriveIndex && drive.drive_date === date);
  };

  // Handle form submission
  const handleFormSubmit = () => {
    if (!isValidDriveDate(formState.driveDate)) {
      alert('Drive must be scheduled at least 15 days in advance.');
      return;
    }

    if (hasDateConflict(formState.driveDate)) {
      alert('Another drive is already scheduled on this date.');
      return;
    }

    if (editDriveIndex !== null) {
      // Update existing drive
      axios
        .put(`http://localhost:3001/api/vaccination-drives/${vaccinationDrives[editDriveIndex].id}`, formState)
        .then(() => {
          const updatedDrives = [...vaccinationDrives];
          updatedDrives[editDriveIndex] = formState;
          setVaccinationDrives(updatedDrives);
          setEditDriveIndex(null);
          setNotification({ open: true, message: 'Drive updated successfully!', severity: 'success' });
        })
        .catch((error) => {
          console.error('❌ Error updating drive:', error.message);
          setNotification({ open: true, message: 'Failed to update drive.', severity: 'error' });
        });
    } else {
      // Create a new drive
      axios
        .post('http://localhost:3001/api/vaccination-drives', formState)
        .then((response) => {
          setVaccinationDrives([...vaccinationDrives, response.data]);
          setNotification({ open: true, message: 'Drive created successfully!', severity: 'success' });
        })
        .catch((error) => {
          console.error('❌ Error creating drive:', error.message);
          setNotification({ open: true, message: 'Failed to create drive.', severity: 'error' });
        });
    }

    // Reset the form state
    setFormState({
      driveTitle: '',
      vaccineName: '',
      driveDate: '',
      vaccineCount: '',
      applicableClass: '',
    });
  };

  // Handle editing a drive
  const handleEditDrive = (index) => {
    const selectedDrive = vaccinationDrives[index];
    setFormState({
      driveTitle: selectedDrive.title,
      vaccineName: selectedDrive.vaccine_name,
      driveDate: dayjs(selectedDrive.drive_date).format('YYYY-MM-DD'),
      vaccineCount: selectedDrive.no_of_vaccine,
      applicableClass: selectedDrive.classname,
    });
    setEditDriveIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check if a drive date is in the past
  const isPastDrive = (date) => {
    return dayjs(date).isBefore(today, 'day');
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

      <Typography variant="h5" gutterBottom>
        Manage Vaccination Drives
      </Typography>

      <Box component={Paper} p={3} mb={4}>
        <Typography variant="h6" gutterBottom>
          {editDriveIndex !== null ? 'Edit Drive' : 'Create Drive'}
        </Typography>

        <TextField
          label="Drive Title"
          name="driveTitle"
          fullWidth
          margin="normal"
          value={formState.driveTitle}
          onChange={handleInputChange}
        />
        <TextField
          label="Vaccine Name"
          name="vaccineName"
          fullWidth
          margin="normal"
          value={formState.vaccineName}
          onChange={handleInputChange}
        />
        <TextField
          label="Drive Date"
          name="driveDate"
          type="date"
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          value={formState.driveDate}
          onChange={handleInputChange}
        />
        <TextField
          label="No. of Vaccines"
          name="vaccineCount"
          type="number"
          fullWidth
          margin="normal"
          value={formState.vaccineCount}
          onChange={handleInputChange}
        />
        <TextField
          label="Applicable Class"
          name="applicableClass"
          fullWidth
          margin="normal"
          value={formState.applicableClass}
          onChange={handleInputChange}
        />

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button variant="contained" color="primary" onClick={handleFormSubmit}>
            {editDriveIndex !== null ? 'Update Drive' : 'Create Drive'}
          </Button>
          <Button variant="outlined" color="error" onClick={() => window.location.reload()}>
            Cancel
          </Button>
        </Box>
      </Box>

      <Typography variant="h6">Upcoming Drives</Typography>
      <Table component={Paper}>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Vaccine</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Doses</TableCell>
            <TableCell>Class</TableCell>
            <TableCell>Edit</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {vaccinationDrives.map((drive, index) => (
            <TableRow key={index}>
              <TableCell>{drive.title}</TableCell>
              <TableCell>{drive.vaccine_name}</TableCell>
              <TableCell>{dayjs(drive.drive_date).format('YYYY-MM-DD')}</TableCell>
              <TableCell>{drive.no_of_vaccine}</TableCell>
              <TableCell>{drive.classname}</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  size="small"
                  disabled={isPastDrive(drive.drive_date)}
                  onClick={() => handleEditDrive(index)}
                >
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ open: false, message: '', severity: 'info' })}
        message={notification.message}
      />
      <Footer />
    </Box>
  );
};

export default ManageVaccination;
