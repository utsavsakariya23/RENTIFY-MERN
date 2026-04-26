import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalUsers: 0,
    totalRevenue: 0,
    activeCars: 0,
    totalCars: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const statsRes = await API.get('/bookings/admin/stats');
        setStats(statsRes.data);
        const bookingsRes = await API.get('/bookings/admin/recent');
        setRecentBookings(bookingsRes.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const [toastMessage, setToastMessage] = useState(null);

  const updateBookingStatus = async (id, status) => {
    try {
      await API.put(`/admin/bookings/${id}/status`, { status });
      // Refresh data
      const bookingsRes = await API.get('/bookings/admin/recent');
      setRecentBookings(bookingsRes.data);
      setToastMessage({ type: 'success', text: `Booking marked as ${status}` });
    } catch (err) {
      setToastMessage({ type: 'danger', text: 'Failed to update booking status' });
    }
  };

  if (loading) return <div className="container py-5 mt-5 text-center"><div className="spinner-border"></div></div>;

  return (
    <main className="container-fluid my-5 pt-5 px-md-5">
      <div className="row mt-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold text-dark mb-0">Admin Dashboard</h2>
            <div className="d-flex gap-2">
              <Link to="/admin/cars" className="btn btn-outline-primary rounded-pill px-4 fw-bold">Manage Fleet</Link>
              <button onClick={() => window.location.reload()} className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm">
                <i className="fas fa-sync-alt me-2"></i>Refresh
              </button>
            </div>
          </div>

          {toastMessage && (
            <div className={`alert alert-${toastMessage.type} alert-dismissible`} role="alert">
              {toastMessage.text}
              <button type="button" className="btn-close" onClick={() => setToastMessage(null)}></button>
            </div>
          )}

          {/* KPI Cards */}
          <div className="row g-4 mb-5">
            <div className="col-md-3">
              <div className="card border-0 p-4 h-100 bg-primary text-white rounded-4 shadow-lg animate__animated animate__fadeInUp">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-white-50 text-uppercase fw-bold small tracking-widest mb-1">Total Bookings</h6>
                    <h2 className="fw-bold mb-0">{stats.totalBookings}</h2>
                  </div>
                  <div className="bg-white bg-opacity-25 p-3 rounded-4">
                    <i className="fas fa-chart-line fa-2x text-white"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 p-4 h-100 bg-white rounded-4 shadow-sm border border-light animate__animated animate__fadeInUp anim-delay-1">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted text-uppercase fw-bold small tracking-widest mb-1">Total Customers</h6>
                    <h2 className="fw-bold mb-0 text-dark">{stats.totalUsers}</h2>
                  </div>
                  <div className="bg-success bg-opacity-10 p-3 rounded-4">
                    <i className="fas fa-users fa-2x text-success"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 p-4 h-100 bg-white rounded-4 shadow-sm border border-light animate__animated animate__fadeInUp anim-delay-2">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted text-uppercase fw-bold small tracking-widest mb-1">Total Revenue</h6>
                    <h2 className="fw-bold mb-0 text-dark">Rs. {stats.totalRevenue.toLocaleString()}</h2>
                  </div>
                  <div className="bg-warning bg-opacity-10 p-3 rounded-4">
                    <i className="fas fa-coins fa-2x text-warning"></i>
                  </div>
                </div>
                <div className="mt-3 small text-muted d-flex align-items-center">
                  Current financial year
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 p-4 h-100 bg-white rounded-4 shadow-sm border border-light animate__animated animate__fadeInUp anim-delay-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted text-uppercase fw-bold small tracking-widest mb-1">Operational Fleet</h6>
                    <h2 className="fw-bold mb-0 text-dark">{stats.activeCars}/{stats.totalCars}</h2>
                  </div>
                  <div className="bg-info bg-opacity-10 p-3 rounded-4">
                    <i className="fas fa-car fa-2x text-info"></i>
                  </div>
                </div>
                <div className="mt-3 small text-muted d-flex align-items-center">
                  {stats.activeCars} vehicles operational
                </div>
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="card border-0 p-4 p-md-5 rounded-4 shadow-sm border border-light animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold text-dark mb-0">Recent Activity</h4>
              <Link to="/admin/bookings" className="btn btn-sm btn-link text-primary text-decoration-none fw-bold">View All</Link>
            </div>
            
            <div className="table-responsive">
              <table className="table table-hover align-middle custom-table">
                <thead>
                  <tr>
                    <th className="border-0 text-muted small fw-bold text-uppercase">ID</th>
                    <th className="border-0 text-muted small fw-bold text-uppercase">Customer</th>
                    <th className="border-0 text-muted small fw-bold text-uppercase">Vehicle</th>
                    <th className="border-0 text-muted small fw-bold text-uppercase">Duration</th>
                    <th className="border-0 text-muted small fw-bold text-uppercase">Price</th>
                    <th className="border-0 text-muted small fw-bold text-uppercase">Status</th>
                    <th className="border-0 text-muted small fw-bold text-uppercase text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b) => (
                    <tr key={b.booking_id}>
                      <td className="fw-bold text-primary">#RNT-{b.booking_id}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-light rounded-circle p-2 me-2 text-muted fw-bold small" style={{ width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                            {b.user_name?.charAt(0)}
                          </div>
                          <span className="fw-medium">{b.user_name}</span>
                        </div>
                      </td>
                      <td>{b.car_name}</td>
                      <td className="small text-muted">
                        {new Date(b.start_date).toLocaleDateString()} - {new Date(b.end_date).toLocaleDateString()}
                      </td>
                      <td className="fw-bold">Rs. {parseFloat(b.total_price || 0).toLocaleString()}</td>
                      <td>
                        <span className={`badge rounded-pill px-3 py-2 smaller ${
                          b.status === 'Confirmed' ? 'bg-success' : 
                          b.status === 'Pending' ? 'bg-warning text-dark' : 'bg-secondary'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="dropdown">
                          <button className="btn btn-light btn-sm rounded-circle p-2 shadow-sm border" data-bs-toggle="dropdown">
                            <i className="fas fa-ellipsis-v"></i>
                          </button>
                          <ul className="dropdown-menu dropdown-menu-end border-0 shadow-lg rounded-3">
                            {b.status === 'Pending' && (
                              <li><button className="dropdown-item text-success" onClick={() => updateBookingStatus(b.booking_id, 'Confirmed')}><i className="fas fa-check me-2"></i>Confirm</button></li>
                            )}
                            {['Pending', 'Confirmed'].includes(b.status) && (
                              <li><button className="dropdown-item text-danger" onClick={() => updateBookingStatus(b.booking_id, 'Cancelled')}><i className="fas fa-times me-2"></i>Cancel</button></li>
                            )}
                            {b.status === 'Confirmed' && (
                              <li><button className="dropdown-item text-primary" onClick={() => updateBookingStatus(b.booking_id, 'Completed')}><i className="fas fa-flag-checkered me-2"></i>Complete</button></li>
                            )}
                            <li><hr className="dropdown-divider" /></li>
                            <li><Link className="dropdown-item" to={`/admin/bookings/${b.booking_id}`}><i className="fas fa-eye me-2"></i>Details</Link></li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {recentBookings.length === 0 && (
                    <tr><td colSpan="7" className="text-center py-5 text-muted">No recent activity found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminDashboard;
