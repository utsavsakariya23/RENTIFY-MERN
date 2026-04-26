import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=email, 2=otp+newpw
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email });
      setSuccess('OTP sent! Check your email inbox (and spam folder).');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match'); setLoading(false); return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters'); setLoading(false); return;
    }
    try {
      await API.post('/auth/reset-password', { email, otp, newPassword });
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    }
    setLoading(false);
  };

  return (
    <main className="d-flex align-items-center bg-light" style={{ minHeight: '100vh', paddingTop: '80px' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4">
            <div className="card border-0 p-4 p-md-5 shadow-lg rounded-4">
              <div className="text-center mb-4">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '70px', height: '70px' }}>
                  <i className="fas fa-key text-primary fs-4"></i>
                </div>
                <h3 className="fw-bold text-dark">Forgot Password</h3>
                <p className="text-muted small">
                  {step === 1 ? "Enter your email to receive an OTP" : "Enter the OTP and your new password"}
                </p>
              </div>

              {/* Progress */}
              <div className="d-flex gap-2 mb-4">
                {[1, 2].map(s => (
                  <div key={s} className={`flex-grow-1 rounded-pill`} style={{ height: '4px', background: step >= s ? '#0d6efd' : '#e9ecef' }}></div>
                ))}
              </div>

              {error && <div className="alert alert-danger rounded-3 py-2"><i className="fas fa-exclamation-circle me-2"></i>{error}</div>}
              {success && <div className="alert alert-success rounded-3 py-2"><i className="fas fa-check-circle me-2"></i>{success}</div>}

              {step === 1 && (
                <form onSubmit={handleSendOTP}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">EMAIL ADDRESS</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0"><i className="fas fa-envelope text-primary"></i></span>
                      <input type="email" className="form-control border-start-0 ps-0" placeholder="Enter your registered email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary w-100 py-2 rounded-pill fw-bold shadow" disabled={loading}>
                    {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Sending...</> : <><i className="fas fa-paper-plane me-2"></i>Send OTP</>}
                  </button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleResetPassword}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">6-DIGIT OTP</label>
                    <input type="text" className="form-control bg-light border-0 p-3 text-center fw-bold fs-5 letter-spacing-lg" maxLength="6" placeholder="000000" value={otp} onChange={e => setOtp(e.target.value)} required />
                    <div className="text-end mt-1">
                      <button type="button" className="btn btn-link btn-sm text-muted p-0 text-decoration-none" onClick={() => { setStep(1); setError(''); setSuccess(''); }}>
                        <i className="fas fa-redo me-1"></i>Resend OTP
                      </button>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">NEW PASSWORD</label>
                    <input type="password" className="form-control bg-light border-0 p-3" placeholder="Min. 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                  </div>
                  <div className="mb-4">
                    <label className="form-label small fw-bold text-muted">CONFIRM NEW PASSWORD</label>
                    <input type="password" className="form-control bg-light border-0 p-3" placeholder="Re-enter new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn btn-success w-100 py-2 rounded-pill fw-bold shadow" disabled={loading}>
                    {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Resetting...</> : <><i className="fas fa-lock me-2"></i>Reset Password</>}
                  </button>
                </form>
              )}

              <div className="text-center mt-4 pt-3 border-top">
                <Link to="/login" className="text-muted small text-decoration-none">
                  <i className="fas fa-arrow-left me-1"></i>Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ForgotPasswordPage;
