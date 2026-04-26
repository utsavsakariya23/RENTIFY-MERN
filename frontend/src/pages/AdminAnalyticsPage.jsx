import React, { useState, useEffect } from 'react';
import API from '../services/api';

const AdminAnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('All'); // All, This Month, This Year

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          API.get('/bookings/admin/stats'),
          API.get('/admin/bookings'),
        ]);
        setStats(statsRes.data);
        setBookings(bookingsRes.data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="container py-5 mt-5 text-center"><div className="spinner-border text-primary"></div></div>;

  // Filter bookings based on selected date range
  const filteredBookings = bookings.filter(b => {
    if (dateFilter === 'All') return true;
    const bookingDate = new Date(b.created_at);
    const now = new Date();
    if (dateFilter === 'This Month') {
      return bookingDate.getMonth() === now.getMonth() && bookingDate.getFullYear() === now.getFullYear();
    }
    if (dateFilter === 'This Year') {
      return bookingDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  // Monthly breakdown from bookings
  const monthlyRevenue = {};
  filteredBookings.filter(b => b.payment_status === 'Paid').forEach(b => {
    const month = new Date(b.created_at).toLocaleString('default', { month: 'short', year: '2-digit' });
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + parseFloat(b.final_price || 0);
  });

  const months = Object.keys(monthlyRevenue).slice(-6);
  const revenues = months.map(m => monthlyRevenue[m]);
  const maxRevenue = Math.max(...revenues, 1);

  // Top cars by booking count
  const carBookings = {};
  filteredBookings.forEach(b => {
    const name = `${b.car?.brand || ''} ${b.car?.name || ''}`.trim() || 'Unknown Vehicle';
    carBookings[name] = (carBookings[name] || 0) + 1;
  });
  const topCars = Object.entries(carBookings).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Status breakdown
  const statusCount = { Pending: 0, Confirmed: 0, Completed: 0, Cancelled: 0 };
  filteredBookings.forEach(b => { if (statusCount[b.booking_status] !== undefined) statusCount[b.booking_status]++; });

  // Payment Breakdown
  const paymentMethodCount = { Cash: 0, Online: 0 };
  filteredBookings.forEach(b => { 
    const method = b.payment_method || 'Cash';
    if(paymentMethodCount[method] !== undefined) paymentMethodCount[method]++; 
  });

  // Coupon Usage
  const couponsUsed = filteredBookings.filter(b => b.coupon_code).length;

  // Real Revenue and GST calculations based on filtered
  const filteredRevenue = filteredBookings.filter(b => b.payment_status === 'Paid').reduce((sum, b) => sum + parseFloat(b.final_price || 0), 0);
  const gstCollected = filteredRevenue * 0.18;

  return (
    <main className="container-fluid my-5 pt-5 px-md-5">
      <div className="row mt-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <div>
              <h2 className="fw-bold text-dark mb-0">Analytics</h2>
              <p className="text-muted small mb-0">Business performance overview</p>
            </div>
            <div>
              <select className="form-select rounded-pill bg-light border-0 shadow-sm px-4 fw-bold" value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
                <option value="All">All Time</option>
                <option value="This Year">This Year</option>
                <option value="This Month">This Month</option>
              </select>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="row g-3 mb-4">
            {[
              { label: 'Total Revenue', value: `Rs. ${filteredRevenue.toLocaleString()}`, icon: 'fas fa-rupee-sign', color: 'success', sub: 'From paid bookings' },
              { label: 'Total Bookings', value: filteredBookings.length, icon: 'fas fa-calendar', color: 'primary', sub: 'In selected period' },
              { label: 'GST Collected', value: `Rs. ${Math.round(gstCollected).toLocaleString()}`, icon: 'fas fa-file-invoice-dollar', color: 'info', sub: '18% of revenue' },
              { label: 'Coupon Uses', value: couponsUsed, icon: 'fas fa-tags', color: 'warning', sub: `Across ${filteredBookings.length} bookings` },
            ].map(card => (
              <div className="col-md-3" key={card.label}>
                <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className={`bg-${card.color} bg-opacity-10 rounded-3 p-3`}>
                      <i className={`${card.icon} text-${card.color} fa-lg`}></i>
                    </div>
                  </div>
                  <div className={`fs-4 fw-bold text-${card.color}`}>{card.value}</div>
                  <div className="text-muted small">{card.label}</div>
                  <div className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>{card.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-4">
            {/* Revenue Chart (CSS bars) */}
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                <h5 className="fw-bold mb-4">Monthly Revenue</h5>
                {months.length === 0 ? (
                  <div className="text-center text-muted py-4">No revenue data yet.</div>
                ) : (
                  <div className="d-flex align-items-end gap-3" style={{ height: '220px' }}>
                    {months.map((month, i) => (
                      <div key={month} className="d-flex flex-column align-items-center flex-grow-1">
                        <div className="small text-muted mb-1" style={{ fontSize: '0.7rem' }}>Rs. {Math.round(revenues[i]).toLocaleString()}</div>
                        <div
                          className="rounded-3 w-100 bg-primary bg-opacity-75"
                          style={{ height: `${Math.max((revenues[i] / maxRevenue) * 180, 10)}px`, transition: 'height 0.5s ease', minWidth: '30px' }}
                        ></div>
                        <div className="small mt-2 text-muted fw-bold" style={{ fontSize: '0.75rem' }}>{month}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Booking Status Breakdown */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                <h5 className="fw-bold mb-4">Booking Status</h5>
                {Object.entries(statusCount).map(([status, count]) => {
                  const pct = bookings.length ? Math.round((count / bookings.length) * 100) : 0;
                  const colorMap = { Pending: 'warning', Confirmed: 'primary', Completed: 'success', Cancelled: 'danger' };
                  return (
                    <div key={status} className="mb-3">
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="fw-bold">{status}</span>
                        <span className="text-muted">{count} ({pct}%)</span>
                      </div>
                      <div className="progress rounded-pill" style={{ height: '8px' }}>
                        <div className={`progress-bar bg-${colorMap[status]} rounded-pill`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Vehicles */}
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                <h5 className="fw-bold mb-4">Most Rented Vehicles</h5>
                {topCars.length === 0 ? (
                  <p className="text-muted">No booking data yet.</p>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {topCars.map(([name, count], i) => (
                      <div className="d-flex align-items-center p-3 bg-light rounded-4" key={name}>
                        <div className="bg-primary text-white rounded-3 fw-bold d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ width: '40px', height: '40px' }}>#{i + 1}</div>
                        <div>
                          <div className="fw-bold small">{name}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{count} booking{count !== 1 ? 's' : ''}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method Breakdown */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                <h5 className="fw-bold mb-4">Payment Methods</h5>
                {filteredBookings.length === 0 ? (
                  <p className="text-muted">No data available.</p>
                ) : (
                  <div className="d-flex flex-column justify-content-center h-100 gap-4 pb-4">
                    {Object.entries(paymentMethodCount).map(([method, count]) => {
                      const pct = Math.round((count / filteredBookings.length) * 100);
                      return (
                        <div key={method} className="text-center">
                          <h2 className="fw-bold text-dark mb-0">{pct}%</h2>
                          <p className="text-muted small fw-bold text-uppercase mb-2">{method}</p>
                          <div className="progress rounded-pill bg-light mx-auto" style={{ height: '6px', maxWidth: '150px' }}>
                            <div className={`progress-bar rounded-pill bg-${method === 'Online' ? 'primary' : 'success'}`} style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminAnalyticsPage;
