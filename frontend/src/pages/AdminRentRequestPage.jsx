import React, { useState, useEffect } from 'react';
import API from '../services/api';

const AdminRentRequestPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [alert, setAlert] = useState(null);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await API.get('/admin/bookings');
      setBookings(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const updateStatus = async (bookingId, status) => {
    try {
      await API.put(`/admin/bookings/${bookingId}/status`, { status });
      setAlert({ type: 'success', msg: `Booking status updated to ${status}.` });
      fetchBookings();
    } catch (err) {
      setAlert({ type: 'danger', msg: 'Failed to update booking status.' });
    }
  };

  const updatePaymentStatus = async (bookingId, status) => {
    try {
      await API.put(`/admin/bookings/${bookingId}/payment`, { status });
      setAlert({ type: 'success', msg: `Payment marked as ${status}.` });
      fetchBookings();
    } catch (err) {
      setAlert({ type: 'danger', msg: 'Failed to update payment status.' });
    }
  };

  const statusBadge = (s) => {
    const map = { Pending: 'warning text-dark', Confirmed: 'primary', Completed: 'success', Cancelled: 'danger' };
    return <span className={`badge bg-${map[s] || 'secondary'} rounded-pill px-3`}>{s}</span>;
  };

  const filtered = filter === 'All' ? bookings : bookings.filter(b => b.booking_status === filter);

  if (loading) return <div className="container py-5 mt-5 text-center"><div className="spinner-border text-primary"></div></div>;

  return (
    <main className="container-fluid my-5 pt-5 px-md-5">
      <div className="row mt-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <div>
              <h2 className="fw-bold text-dark mb-0">Rent Requests</h2>
              <p className="text-muted small">Manage all booking requests</p>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(s => (
                <button key={s} className={`btn rounded-pill px-3 btn-sm fw-bold ${filter === s ? 'btn-primary' : 'btn-light border'}`} onClick={() => setFilter(s)}>{s}</button>
              ))}
            </div>
          </div>

          {alert && (
            <div className={`alert alert-${alert.type} alert-dismissible d-flex align-items-center`}>
              <i className={`fas fa-${alert.type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2`}></i>
              {alert.msg}
              <button type="button" className="btn-close ms-auto" onClick={() => setAlert(null)}></button>
            </div>
          )}

          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    {['#', 'Customer', 'Car', 'Dates', 'Locations', 'Price', 'Status', 'Payment', 'Actions'].map(h => (
                      <th key={h} className="border-0 text-muted small fw-bold text-uppercase py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => (
                    <tr key={b.booking_id}>
                      <td className="text-muted ps-3">#{b.booking_id}</td>
                      <td>
                        <div className="fw-bold">{b.user?.name}</div>
                        <div className="text-muted small">{b.user?.email}</div>
                      </td>
                      <td>
                        <div className="fw-bold">{b.car?.name}</div>
                        <div className="text-muted small">{b.car?.brand}</div>
                      </td>
                      <td>
                        <div className="small">{b.start_date}</div>
                        <div className="small text-muted">→ {b.end_date}</div>
                        <span className="badge bg-light text-dark border">{b.total_days}d</span>
                      </td>
                      <td>
                        <div className="small"><i className="fas fa-map-marker-alt text-success me-1"></i>{b.pickup_location || '—'}</div>
                        <div className="small"><i className="fas fa-map-marker-alt text-danger me-1"></i>{b.drop_location || '—'}</div>
                      </td>
                      <td><strong>Rs. {b.final_price}</strong></td>
                      <td>{statusBadge(b.booking_status)}</td>
                      <td>
                        <span className={`badge rounded-pill px-3 bg-${b.payment_status === 'Paid' ? 'success' : b.payment_status === 'Refunded' ? 'info' : 'secondary'}`}>
                          {b.payment_status}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          {b.booking_status === 'Pending' && (
                            <button className="btn btn-sm btn-success rounded-pill px-2" onClick={() => updateStatus(b.booking_id, 'Confirmed')}>
                              <i className="fas fa-check me-1"></i>Confirm
                            </button>
                          )}
                          {b.payment_status !== 'Paid' && b.booking_status !== 'Cancelled' && (
                            <button className="btn btn-sm btn-info text-white rounded-pill px-2" onClick={() => updatePaymentStatus(b.booking_id, 'Paid')}>
                              <i className="fas fa-money-bill-check me-1"></i>Payment Done
                            </button>
                          )}
                          {b.booking_status === 'Confirmed' && (
                            <button 
                              className="btn btn-sm btn-primary rounded-pill px-2" 
                              onClick={() => updateStatus(b.booking_id, 'Completed')}
                              disabled={b.payment_status !== 'Paid'}
                              title={b.payment_status !== 'Paid' ? 'Payment must be completed first' : ''}
                            >
                              <i className="fas fa-flag-checkered me-1"></i>Complete
                            </button>
                          )}
                          {(b.booking_status === 'Pending' || b.booking_status === 'Confirmed') && (
                            <button className="btn btn-sm btn-danger rounded-pill px-2" onClick={() => updateStatus(b.booking_id, 'Cancelled')}>
                              <i className="fas fa-times me-1"></i>Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan="9" className="text-center py-5 text-muted">No bookings for this filter.</td></tr>
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

export default AdminRentRequestPage;
