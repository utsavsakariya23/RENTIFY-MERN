import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      navigate(redirectPath, { replace: true });
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <main className="d-flex align-items-center bg-light" style={{ minHeight: '100vh', paddingTop: '80px' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4">
            <div className="card border-0 p-4 shadow-lg rounded-4">
              <div className="text-center mb-4">
                <h3 className="fw-bold text-dark">Welcome Back</h3>
                <p className="text-muted small">Please login to your account</p>
              </div>

              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  <i className="fas fa-exclamation-circle me-2"></i>{error}
                  <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">EMAIL ADDRESS</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <i className="fas fa-envelope text-primary"></i>
                    </span>
                    <input 
                      type="email" 
                      className="form-control border-start-0 ps-0" 
                      name="email"
                      placeholder="Enter email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">PASSWORD</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <i className="fas fa-lock text-primary"></i>
                    </span>
                    <input 
                      type="password" 
                      className="form-control border-start-0 ps-0" 
                      name="password"
                      placeholder="Enter password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="rememberMe" />
                    <label className="form-check-label small" htmlFor="rememberMe">Remember Me</label>
                  </div>
                  <Link to="/forgot-password" className="small text-decoration-none text-primary">Forgot Password?</Link>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100 py-2 mb-3 shadow rounded-pill fw-bold"
                  disabled={loading}
                >
                  {loading ? 'LOGGING IN...' : 'LOG IN'}
                </button>

                <div className="text-center">
                  <span className="text-muted small">Don't have an account?</span>
                  <Link to="/register" className="fw-bold text-decoration-none ms-1">Register Now</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
