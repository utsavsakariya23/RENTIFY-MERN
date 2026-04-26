import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [usernameStatus, setUsernameStatus] = useState(''); // '', 'checking', 'available', 'taken'

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear field error on change
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Check username availability with debounce
  const checkUsername = async (username) => {
    if (!username || username.length < 3) { setUsernameStatus(''); return; }
    setUsernameStatus('checking');
    try {
      const { data } = await API.post('/auth/check-username', { username });
      setUsernameStatus(data.available ? 'available' : 'taken');
    } catch {
      setUsernameStatus('');
    }
  };

  const sendOTP = async () => {
    setError('');
    setSuccess('');
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      const { data } = await API.post('/otp/send-otp', { email: email.trim().toLowerCase() });
      if (data.success) {
        setOtpSent(true);
        setSuccess('OTP sent to your email. Check your inbox.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP';
      if (err.response?.status === 409) {
        setError('');
        setFieldErrors(prev => ({ ...prev, email: msg }));
      } else {
        setError(msg);
      }
    }
    setLoading(false);
  };

  const verifyOTP = async () => {
    setError('');
    setLoading(true);
    try {
      const { data } = await API.post('/otp/verify-otp', { email, otp });
      if (data.success) {
        setOtpVerified(true);
        setSuccess('Email verified successfully!');
        setTimeout(() => {
          setStep(2);
          setSuccess('');
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP');
    }
    setLoading(false);
  };

  const validateStep2 = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone.trim())) errs.phone = 'Enter a valid 10-digit phone number';
    if (!formData.address.trim()) errs.address = 'Address is required';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!formData.username.trim()) errs.username = 'Username is required';
    else if (formData.username.trim().length < 3) errs.username = 'Username must be at least 3 characters';
    else if (usernameStatus === 'taken') errs.username = 'This username is already taken';
    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setError('');
    try {
      const { data } = await API.post('/auth/register', {
        name: formData.fullName,
        username: formData.username,
        email,
        password: formData.password,
        phone_number: formData.phone,
        address: formData.address
      });
      
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <main className="d-flex align-items-center bg-light" style={{ minHeight: '100vh', paddingTop: '80px' }}>
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card border-0 p-4 p-md-5 shadow-lg rounded-4">
              <div className="text-center mb-4">
                <h3 className="fw-bold text-dark">Create Account</h3>
                <p className="text-muted">Step {step} of 3</p>
              </div>

              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              {/* Progress Bar */}
              <div className="progress mb-4" style={{ height: '5px' }}>
                <div 
                  className="progress-bar bg-primary" 
                  role="progressbar" 
                  style={{ width: `${(step / 3) * 100}%` }}
                ></div>
              </div>

              {step === 1 && (
                <div className="animate__animated animate__fadeIn">
                  <h6 className="text-primary fw-bold text-uppercase mb-3">Email Verification</h6>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">EMAIL ADDRESS <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <input 
                        type="email" 
                        className={`form-control bg-light border-0 p-3 ${fieldErrors.email ? 'border border-danger' : ''}`}
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' })); }}
                        placeholder="Enter your email" 
                        disabled={otpSent}
                      />
                      {!otpSent && (
                        <button className="btn btn-primary px-4" onClick={sendOTP} disabled={loading || !email.trim()}>
                          {loading ? <><span className="spinner-border spinner-border-sm me-1"></span>Sending...</> : 'Send OTP'}
                        </button>
                      )}
                    </div>
                    {fieldErrors.email && (
                      <div className="text-danger small mt-2">
                        <i className="fas fa-exclamation-circle me-1"></i>{fieldErrors.email}{' '}
                        <Link to="/login" className="fw-bold text-primary text-decoration-none">Login Here →</Link>
                      </div>
                    )}
                  </div>

                  {otpSent && !otpVerified && (
                    <div className="mb-3 animate__animated animate__fadeIn">
                      <label className="form-label small fw-bold">ENTER 6-DIGIT OTP</label>
                      <input 
                        type="text" 
                        className="form-control bg-light border-0 p-3 text-center fw-bold letter-spacing-lg" 
                        maxLength="6"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="000000"
                      />
                      <button className="btn btn-primary w-100 mt-3 py-3 rounded-pill fw-bold" onClick={verifyOTP} disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify Email'}
                      </button>
                      <button className="btn btn-link w-100 mt-2 text-muted small text-decoration-none" onClick={sendOTP}>
                        Resend OTP
                      </button>
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="animate__animated animate__fadeIn">
                  <h6 className="text-primary fw-bold text-uppercase mb-3">Personal Details</h6>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">FULL NAME <span className="text-danger">*</span></label>
                    <input 
                      type="text" 
                      className={`form-control bg-light border-0 p-3 ${fieldErrors.fullName ? 'border border-danger' : ''}`}
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name" 
                    />
                    {fieldErrors.fullName && <div className="text-danger small mt-1">{fieldErrors.fullName}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">PHONE NUMBER <span className="text-danger">*</span></label>
                    <input 
                      type="text" 
                      className={`form-control bg-light border-0 p-3 ${fieldErrors.phone ? 'border border-danger' : ''}`}
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter 10-digit phone number" 
                      maxLength="10"
                    />
                    {fieldErrors.phone && <div className="text-danger small mt-1">{fieldErrors.phone}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">FULL ADDRESS <span className="text-danger">*</span></label>
                    <input 
                      type="text" 
                      className={`form-control bg-light border-0 p-3 ${fieldErrors.address ? 'border border-danger' : ''}`}
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter your full home address" 
                    />
                    {fieldErrors.address && <div className="text-danger small mt-1">{fieldErrors.address}</div>}
                  </div>
                  <button className="btn btn-primary w-100 py-3 rounded-pill fw-bold" onClick={() => { if (validateStep2()) setStep(3); }}>
                    Continue
                  </button>
                  <button className="btn btn-link w-100 mt-2 text-muted" onClick={() => setStep(1)}>Back</button>
                </div>
              )}

              {step === 3 && (
                <form className="animate__animated animate__fadeIn" onSubmit={handleRegister}>
                  <h6 className="text-primary fw-bold text-uppercase mb-3">Account Setup</h6>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">USERNAME <span className="text-danger">*</span></label>
                    <input 
                      type="text" 
                      className={`form-control bg-light border-0 p-3 ${fieldErrors.username ? 'border border-danger' : usernameStatus === 'available' ? 'border border-success' : ''}`}
                      name="username"
                      value={formData.username}
                      onChange={(e) => { handleInputChange(e); clearTimeout(window._usernameTimer); window._usernameTimer = setTimeout(() => checkUsername(e.target.value), 500); }}
                      placeholder="Choose a unique username" 
                    />
                    {usernameStatus === 'checking' && <div className="text-muted small mt-1"><i className="fas fa-spinner fa-spin me-1"></i>Checking availability...</div>}
                    {usernameStatus === 'available' && <div className="text-success small mt-1"><i className="fas fa-check-circle me-1"></i>Username is available</div>}
                    {usernameStatus === 'taken' && <div className="text-danger small mt-1"><i className="fas fa-times-circle me-1"></i>Username is already taken</div>}
                    {fieldErrors.username && <div className="text-danger small mt-1">{fieldErrors.username}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">PASSWORD <span className="text-danger">*</span></label>
                    <input 
                      type="password" 
                      className={`form-control bg-light border-0 p-3 ${fieldErrors.password ? 'border border-danger' : ''}`}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Minimum 6 characters" 
                    />
                    {fieldErrors.password && <div className="text-danger small mt-1">{fieldErrors.password}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">CONFIRM PASSWORD <span className="text-danger">*</span></label>
                    <input 
                      type="password" 
                      className={`form-control bg-light border-0 p-3 ${fieldErrors.confirmPassword ? 'border border-danger' : ''}`}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm password" 
                    />
                    {fieldErrors.confirmPassword && <div className="text-danger small mt-1">{fieldErrors.confirmPassword}</div>}
                  </div>
                  <button type="submit" className="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                  <button type="button" className="btn btn-link w-100 mt-2 text-muted" onClick={() => setStep(2)}>Back</button>
                </form>
              )}

              <div className="text-center mt-4 pt-3 border-top">
                <span className="text-muted small">Already have an account?</span>
                <Link to="/login" className="fw-bold text-decoration-none ms-1">Login Here</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default RegisterPage;
