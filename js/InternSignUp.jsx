import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  InputAdornment,
  Card,
  CardContent,
  Chip,
  Grid,
} from '@mui/material';
import { Email, Phone, Person, School, Lock, CheckCircle, ContentCopy } from '@mui/icons-material';
import axios from 'axios';

const InternSignUp = ({ onSignUpSuccess }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [referralCode, setReferralCode] = useState('');

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: '',
    email: '',
    phone: '',
    
    // Step 2: College Info
    college: '',
    degree: '',
    graduationYear: new Date().getFullYear(),
    
    // Step 3: Account Setup
    password: '',
    confirmPassword: '',
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);

  const steps = ['Basic Info', 'College Details', 'Verify Email', 'Account Setup', 'Complete'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        if (!formData.name.trim()) {
          setError('Name is required');
          return false;
        }
        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          setError('Please enter a valid email');
          return false;
        }
        if (!formData.phone.match(/^[6-9]\d{9}$/)) {
          setError('Please enter a valid 10-digit phone number');
          return false;
        }
        return true;

      case 1:
        if (!formData.college.trim()) {
          setError('College name is required');
          return false;
        }
        if (!formData.degree) {
          setError('Degree is required');
          return false;
        }
        if (!formData.graduationYear) {
          setError('Graduation year is required');
          return false;
        }
        return true;

      case 2:
        if (!otpVerified) {
          setError('Please verify your email with OTP');
          return false;
        }
        return true;

      case 3:
        if (!formData.password.trim()) {
          setError('Password is required');
          return false;
        }
        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/auth/send-otp', { email: formData.email });
      setOtpSent(true);
      setSuccess('OTP sent to your email');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/auth/verify-otp', {
        email: formData.email,
        otp,
      });
      setOtpVerified(true);
      setSuccess('Email verified successfully');
      setTimeout(() => {
        handleNext();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (!validateStep(activeStep)) return;

    if (activeStep === steps.length - 2) {
      // Complete signup
      setLoading(true);
      setError('');
      try {
        const response = await axios.post('/api/auth/signup', {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          college: formData.college,
          degree: formData.degree,
          graduationYear: formData.graduationYear,
          password: formData.password,
        });

        setReferralCode(response.data.referralCode);
        setSuccess('Signup successful!');
        setActiveStep(activeStep + 1);

        if (onSignUpSuccess) {
          setTimeout(() => {
            onSignUpSuccess(response.data);
          }, 1500);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Signup failed');
      } finally {
        setLoading(false);
      }
    } else {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
      setError('');
    }
  };

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setSuccess('Referral code copied to clipboard!');
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <School sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Join She Can Foundation
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Become an intern and make a difference
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ minHeight: 300 }}>
          {/* Step 0: Basic Info */}
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Tell us about yourself
              </Typography>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="10-digit number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
            </Box>
          )}

          {/* Step 1: College Details */}
          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                College Information
              </Typography>
              <TextField
                fullWidth
                label="College Name"
                name="college"
                value={formData.college}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Degree/Program"
                name="degree"
                value={formData.degree}
                onChange={handleInputChange}
                placeholder="e.g., B.Tech CSE"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Expected Graduation Year"
                name="graduationYear"
                type="number"
                value={formData.graduationYear}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
            </Box>
          )}

          {/* Step 2: Email Verification */}
          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Verify Your Email
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                We've sent a verification code to <strong>{formData.email}</strong>
              </Alert>
              
              {!otpSent && (
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSendOtp}
                  disabled={loading}
                  sx={{ mb: 2, backgroundColor: '#4CAF50' }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Send OTP'}
                </Button>
              )}

              {otpSent && !otpVerified && (
                <>
                  <TextField
                    fullWidth
                    label="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="6-digit code"
                    sx={{ mb: 2 }}
                    maxLength="6"
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleVerifyOtp}
                    disabled={loading || otp.length !== 6}
                    sx={{ backgroundColor: '#4CAF50' }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
                  </Button>
                </>
              )}

              {otpVerified && (
                <Box sx={{ textAlign: 'center' }}>
                  <CheckCircle sx={{ fontSize: 60, color: '#4CAF50', mb: 1 }} />
                  <Typography variant="body1" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                    Email verified successfully!
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Step 3: Account Setup */}
          {activeStep === 3 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Create Your Password
              </Typography>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
                helperText="At least 8 characters"
              />
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          )}

          {/* Step 4: Success */}
          {activeStep === 4 && (
            <Box sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 80, color: '#4CAF50', mb: 2 }} />
              <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold', color: '#4CAF50' }}>
                Welcome, {formData.name}!
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Your account has been created successfully
              </Typography>

              <Card sx={{ backgroundColor: '#f0f7f0', border: '2px solid #4CAF50', mb: 3 }}>
                <CardContent>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    Your Referral Code
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        color: '#4CAF50',
                        letterSpacing: 2,
                      }}
                    >
                      {referralCode}
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<ContentCopy />}
                      onClick={handleCopyReferralCode}
                      sx={{ color: '#4CAF50' }}
                    >
                      Copy
                    </Button>
                  </Box>
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                    Share this code with your friends to earn stipend!
                  </Typography>
                </CardContent>
              </Card>

              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Your Goal: 30,000
              </Typography>
              <Chip label="20% Stipend" color="success" variant="outlined" />
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0 || activeStep === 4}
            sx={{ flex: 1 }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={loading || (activeStep === 2 && !otpVerified) || activeStep === 4}
            sx={{ flex: 1, backgroundColor: '#4CAF50' }}
          >
            {loading ? <CircularProgress size={24} /> : activeStep === steps.length - 2 ? 'Complete' : 'Next'}
          </Button>
        </Box>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            Already have an account?{' '}
            <Typography
              component="span"
              sx={{ color: '#4CAF50', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Sign In
            </Typography>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default InternSignUp;
