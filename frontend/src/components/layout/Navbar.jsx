import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { userInfo, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-custom fixed-top">
      <div className="container">
        <Link className="navbar-brand fw-bold fs-4" to="/">
          <i className="fas fa-car-side me-2 text-primary"></i>RENTIFY
        </Link>
        <button
          className="navbar-toggler navbar-dark"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">HOME</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/cars">VEHICLES</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/about">ABOUT</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contact">CONTACT</Link>
            </li>
          </ul>

          <ul className="navbar-nav align-items-center">
            {userInfo ? (
              <>
                {userInfo.role === 'Admin' && (
                  <li className="nav-item">
                    <Link className="nav-link text-info fw-bold" to="/admin/dashboard">
                      <i className="fas fa-hammer me-1"></i> DASHBOARD
                    </Link>
                  </li>
                )}

                <li className="nav-item">
                  <Link className="nav-link" to="/profile">
                    <i className="fas fa-user-circle me-1"></i> PROFILE
                  </Link>
                </li>
                <li className="nav-item">
                  <button
                    onClick={handleLogout}
                    className="nav-link btn btn-link text-danger border-0"
                    style={{ textDecoration: 'none' }}
                  >
                    LOGOUT
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link text-dark" to="/login">LOGIN</Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-outline-primary ms-lg-2 px-4 rounded-pill" to="/register">
                    REGISTER
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
