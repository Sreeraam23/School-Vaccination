import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Paper, List, ListItem,
  AppBar, Toolbar, Button, CircularProgress, Avatar, Divider, Container
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import { useNavigate } from 'react-router-dom';
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
        School Vaccination Portal © {new Date().getFullYear()}
      </Typography>
    </Container>
  </Box>
);

// Card styles for dashboard items
const dashboardCardStyles = {
  borderRadius: 3,
  p: 3,
  minHeight: 200,
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-6px) scale(1.03)',
    boxShadow: '0 12px 32px 0 rgba(31, 38, 135, 0.25)',
    background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
  }
};

// Avatar styles for icons
const avatarStyles = (bgColor) => ({
  bgcolor: bgColor,
  width: 56,
  height: 56,
  mb: 2,
  boxShadow: '0 4px 12px rgba(0,0,0,0.07)'
});

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3001/api/dashboard/summary')
      .then((response) => {
        if (!response.ok) throw new Error('Unable to fetch dashboard data');
        return response.json();
      })
      .then((data) => {
        setDashboardData(data);
        setFetchError(null);
      })
      .catch((error) => {
        setFetchError(error.message);
        setDashboardData(null);
      });
  }, []);

  if (fetchError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography color="error" variant="h6">{fetchError}</Typography>
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress size={64} thickness={5} color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      {/* Navigation Bar */}
      <AppBar position="static" sx={{ background: 'linear-gradient(90deg,#4caf50,#2e7d32)' }}>
        <Toolbar>
          <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1 }}>
            School Vaccination Portal
          </Typography>
          <Button color="inherit" sx={{ fontWeight: 600 }} onClick={() => navigate('/students')}>
            Manage Students
          </Button>
          <Button color="inherit" sx={{ fontWeight: 600 }} onClick={() => navigate('/vaccinations')}>
            Manage Vaccination
          </Button>
          <Button color="inherit" sx={{ fontWeight: 600 }} onClick={() => navigate('/report')}>
            Reports
          </Button>
          <Button
            color="inherit"
            sx={{ fontWeight: 600, ml: 2 }}
            onClick={() => window.location.href = 'http://localhost:3000/'}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Dashboard Content */}
      <Box p={{ xs: 2, md: 4 }} maxWidth="1200px" mx="auto">
        <Typography variant="h4" fontWeight={700} mb={4} color="#2e7d32" letterSpacing={1}>
          Dashboard Overview
        </Typography>
        <Grid container spacing={4}>
          {/* Total Students */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={0} sx={dashboardCardStyles}>
              <Avatar sx={avatarStyles('#4caf50')}>
                <GroupIcon fontSize="large" />
              </Avatar>
              <Typography variant="subtitle1" color="text.secondary">Total Students</Typography>
              <Typography variant="h3" fontWeight={700} color="#2e7d32">
                {dashboardData.totalStudents}
              </Typography>
            </Paper>
          </Grid>

          {/* Vaccinated Students */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={0} sx={dashboardCardStyles}>
              <Avatar sx={avatarStyles('#43a047')}>
                <HealthAndSafetyIcon fontSize="large" />
              </Avatar>
              <Typography variant="subtitle1" color="text.secondary">Vaccinated Students</Typography>
              <Typography variant="h3" fontWeight={700} color="#43a047">
                {dashboardData.vaccinatedStudents}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                {dashboardData.vaccinationRate}% Vaccinated
              </Typography>
            </Paper>
          </Grid>

          {/* Upcoming Drives */}
          <Grid item xs={12} sm={12} md={4}>
            <Paper elevation={0} sx={dashboardCardStyles}>
              <Avatar sx={avatarStyles('#ff9800')}>
                <EventIcon fontSize="large" />
              </Avatar>
              <Typography variant="subtitle1" color="text.secondary">Upcoming Drives (30 days)</Typography>
              <Divider sx={{ my: 1 }} />
              {dashboardData.upcomingDrives && dashboardData.upcomingDrives.length > 0 ? (
                <List dense>
                  {dashboardData.upcomingDrives.map((drive) => (
                    <ListItem key={drive.id} sx={{ px: 0, py: 0.5 }}>
                      <Typography variant="body1" fontWeight={500}>
                        {drive.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        {dayjs(drive.drive_date).format('YYYY-MM-DD')}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="error" mt={2}>No upcoming drives</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
      <Footer />
    </Box>
  );
};

export default Dashboard;
