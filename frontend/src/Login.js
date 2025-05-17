import React from 'react';
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  Paper,
  Avatar,
  CssBaseline,
  Alert,
  Link
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom';

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
          School Vaccination Portal
        {new Date().getFullYear()}
        {"."}
      </Typography>
    </Container>
  </Box>
);

function Login() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = React.useState('');
  const [userPassword, setUserPassword] = React.useState('');
  const [loginError, setLoginError] = React.useState(false);
  const [resetVisible, setResetVisible] = React.useState(false);
  const [resetEmail, setResetEmail] = React.useState('');
  const [resetSuccess, setResetSuccess] = React.useState(false);

  // Handle login logic
  const handleLoginSubmit = (e) => {
    e.preventDefault();

    if (userEmail === 'admin@school.com' && userPassword === 'admin123') {
      setLoginError(false);
      navigate('/Dashboard'); // Redirect to Dashboard page after successful login
    } else {
      setLoginError(true);
    }
  };

  // Show password reset form
  const handleShowResetForm = (e) => {
    e.preventDefault();
    setResetVisible(true);
    setResetSuccess(false);
    setResetEmail('');
  };

  // Handle password reset logic
  const handlePasswordReset = (e) => {
    e.preventDefault();
    // Backend logic to send reset email should be added here
    setResetSuccess(true);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        minWidth: '100vw',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url("/vaccine.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay for readability */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          bgcolor: 'rgba(255,255,255,0.60)',
          zIndex: 1,
          top: 0,
          left: 0,
        }}
      />
      <CssBaseline />
      <Container
        component="main"
        maxWidth="xs"
        sx={{ p: 0, position: 'relative', zIndex: 2 }}
      >
        <Paper
          elevation={8}
          sx={{
            padding: 4,
            borderRadius: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            background: 'rgba(255,255,255,0.95)',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main', boxShadow: 3 }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            School Vaccination Portal
          </Typography>

          {/* Main Login Form */}
          {!resetVisible && (
            <>
              {loginError && (
                <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                  Invalid credentials. Please check your email and password.
                </Alert>
              )}

              <Box component="form" onSubmit={handleLoginSubmit} sx={{ mt: 1, width: '100%' }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  sx={{ backgroundColor: 'white', borderRadius: 1 }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  sx={{ backgroundColor: 'white', borderRadius: 1 }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 3,
                    mb: 1,
                    fontWeight: 600,
                    letterSpacing: 1,
                    py: 1.5,
                    background: "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)"
                  }}
                >
                  Login
                </Button>
                <Box textAlign="center" sx={{ mt: 1 }}>
                  <Link href="#" onClick={handleShowResetForm} variant="body2">
                    Forgot password?
                  </Link>
                </Box>
              </Box>
            </>
          )}

          {/* Password Reset Form */}
          {resetVisible && (
            <Box sx={{ mt: 2, width: '100%' }}>
              {!resetSuccess ? (
                <form onSubmit={handlePasswordReset}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Reset Password
                  </Typography>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="reset-email"
                    label="Enter your email address"
                    name="reset-email"
                    autoComplete="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    sx={{ backgroundColor: 'white', borderRadius: 1 }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{
                      mt: 2,
                      fontWeight: 600,
                      background: "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)"
                    }}
                  >
                    Send Reset Instructions
                  </Button>
                  <Box textAlign="center" sx={{ mt: 2 }}>
                    <Link href="#" onClick={() => setResetVisible(false)} variant="body2">
                      Back to Login
                    </Link>
                  </Box>
                </form>
              ) : (
                <>
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Password reset instructions have been sent to your email.
                  </Alert>
                  <Box textAlign="center" sx={{ mt: 2 }}>
                    <Link href="#" onClick={() => setResetVisible(false)} variant="body2">
                      Back to Login
                    </Link>
                  </Box>
                </>
              )}
            </Box>
          )}
        </Paper>
      </Container>
      <Footer />
    </Box>
  );
}

export default Login;
