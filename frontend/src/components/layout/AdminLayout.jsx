import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const adminNavLinks = [
  { path: '/admin/dashboard', icon: 'fas fa-th-large', label: 'Dashboard' },
  { path: '/admin/rent-requests', icon: 'fas fa-calendar-check', label: 'Rent Requests' },
  { path: '/admin/cars', icon: 'fas fa-car', label: 'Fleet Management' },
  { path: '/admin/customers', icon: 'fas fa-users', label: 'Customers' },
  { path: '/admin/payments', icon: 'fas fa-credit-card', label: 'Payments' },
  { path: '/admin/coupons', icon: 'fas fa-tag', label: 'Coupons' },
  { path: '/admin/messages', icon: 'fas fa-envelope', label: 'Messages' },
  { path: '/admin/reviews', icon: 'fas fa-star', label: 'Reviews' },
  { path: '/admin/analytics', icon: 'fas fa-chart-bar', label: 'Analytics' },
  { path: '/admin/maintenance', icon: 'fas fa-tools', label: 'Fleet Maintenance' },
  { path: '/admin/business', icon: 'fas fa-chart-pie', label: 'Business' },
  { path: '/admin/documents', icon: 'fas fa-id-card', label: 'Documents' },
  { path: '/admin/profile', icon: 'fas fa-user-cog', label: 'Admin Profile' },
  { path: '/admin/city-points', icon: 'fas fa-map-marker-alt', label: 'City Points' },
];


const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userInfo, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', paddingTop: '76px' }}>
      {/* Sidebar */}
      <div
        className="d-flex flex-column bg-white border-end shadow-sm"
        style={{
          width: collapsed ? '70px' : '240px',
          minHeight: 'calc(100vh - 76px)',
          transition: 'width 0.3s ease',
          position: 'fixed',
          top: '76px',
          left: 0,
          bottom: 0,
          zIndex: 100,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {/* Sidebar Header */}
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
          {!collapsed && (
            <div>
              <div className="fw-bold text-primary small">ADMIN PANEL</div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>{userInfo?.name}</div>
            </div>
          )}
          <button
            className="btn btn-sm btn-light rounded-circle border"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <i className={`fas fa-${collapsed ? 'chevron-right' : 'chevron-left'}`}></i>
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-grow-1 py-2">
          {adminNavLinks.map(({ path, icon, label }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                title={collapsed ? label : ''}
                className={`d-flex align-items-center px-3 py-2 text-decoration-none rounded-3 mx-2 mb-1 ${
                  active
                    ? 'bg-primary text-white fw-bold'
                    : 'text-muted hover-lift'
                }`}
                style={{ fontSize: '0.875rem', transition: 'all 0.2s' }}
              >
                <i className={`${icon} ${collapsed ? '' : 'me-3'}`} style={{ width: '18px', textAlign: 'center' }}></i>
                {!collapsed && label}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-top">
          <button
            onClick={handleLogout}
            title={collapsed ? 'Logout' : ''}
            className="btn btn-outline-danger w-100 rounded-pill d-flex align-items-center justify-content-center gap-2"
            style={{ fontSize: '0.85rem' }}
          >
            <i className="fas fa-sign-out-alt"></i>
            {!collapsed && 'Logout'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ marginLeft: collapsed ? '70px' : '240px', flex: 1, transition: 'margin 0.3s ease' }}>
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
