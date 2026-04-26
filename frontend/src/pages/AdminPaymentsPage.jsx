import React, { useState, useEffect } from 'react';
import API from '../services/api';

const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [alert, setAlert] = useState(null);
  const [refunding, setRefunding] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data } = await API.get('/admin/bookings');
        setPayments(data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchPayments();
  }, []);

  const filtered = filter === 'All' ? payments : payments.filter(p => p.payment_status === filter);
  const totalRevenue = payments.filter(p => p.payment_status === 'Paid').reduce((sum, p) => sum + parseFloat(p.final_price || 0), 0);

  const handleRefund = async (bookingId) => {
    if (!window.confirm('Initiate refund for this payment? This cannot be undone.')) return;
    setRefunding(bookingId);
    try {
      await API.post(`/payment/refund/${bookingId}`, { reason: 'Admin initiated refund' });
      setAlert({ type: 'success', msg: `Refund initiated for Booking #${bookingId}. Customer will be notified.` });
      setPayments(prev => prev.map(p => p.booking_id === bookingId ? { ...p, payment_status: 'Refunded', booking_status: 'Cancelled' } : p));
    } catch (err) {
      setAlert({ type: 'danger', msg: err.response?.data?.message || 'Refund failed. Ensure Razorpay is configured.' });
    }
    setRefunding(null);
  };

  if (loading) return <div className="container py-5 mt-5 text-center"><div className="spinner-border text-primary"></div></div>;

  return (
    <main className="container-fluid my-5 pt-5 px-md-5">
      <div className="row mt-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold text-dark mb-0">Payments</h2>
              <p className="text-muted small">Track all payment transactions</p>
            </div>
          </div>

          {alert && <div className={`alert alert-${alert.type} alert-dismissible rounded-3 mb-4`}>{alert.msg}<button className="btn-close" onClick={() => setAlert(null)}></button></div>}

          {/* Summary Cards */}
          <div className="row g-3 mb-4">
            {[
              { label: 'Total Revenue', value: `Rs. ${totalRevenue.toFixed(0)}`, icon: 'fas fa-rupee-sign', color: 'success' },
              { label: 'Paid', value: payments.filter(p => p.payment_status === 'Paid').length, icon: 'fas fa-check-circle', color: 'primary' },
              { label: 'Unpaid', value: payments.filter(p => p.payment_status === 'Unpaid').length, icon: 'fas fa-clock', color: 'warning' },
              { label: 'Refunded', value: payments.filter(p => p.payment_status === 'Refunded').length, icon: 'fas fa-undo', color: 'info' },
            ].map((card) => (
              <div className="col-md-3" key={card.label}>
                <div className="card border-0 shadow-sm rounded-4 p-4">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="text-muted small mb-1">{card.label}</div>
                      <div className={`fs-4 fw-bold text-${card.color}`}>{card.value}</div>
                    </div>
                    <div className={`bg-${card.color} bg-opacity-10 rounded-3 p-3`}>
                      <i className={`${card.icon} text-${card.color} fa-lg`}></i>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filter */}
          <div className="d-flex gap-2 mb-3">
            {['All', 'Paid', 'Unpaid', 'Refunded'].map(s => (
              <button key={s} className={`btn rounded-pill px-3 btn-sm fw-bold ${filter === s ? 'btn-primary' : 'btn-light border'}`} onClick={() => setFilter(s)}>{s}</button>
            ))}
          </div>

          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    {['#', 'Customer', 'Car', 'Booking Period', 'Amount', 'Method', 'Transaction ID', 'Status', 'Action'].map(h => (
                      <th key={h} className="border-0 text-muted small fw-bold text-uppercase py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.booking_id}>
                      <td className="ps-3 text-muted">#{p.booking_id}</td>
                      <td>
                        <div className="fw-bold">{p.user?.name}</div>
                        <div className="text-muted small">{p.user?.email}</div>
                      </td>
                      <td>{p.car?.brand} {p.car?.name}</td>
                      <td className="small">{p.start_date} → {p.end_date}</td>
                      <td><strong className="text-primary">Rs. {p.final_price}</strong></td>
                      <td>{p.payment_method || 'Cash'}</td>
                      <td><code className="small">{p.transaction_id || '—'}</code></td>
                      <td>
                        <span className={`badge rounded-pill px-3 bg-${p.payment_status === 'Paid' ? 'success' : p.payment_status === 'Refunded' ? 'info' : 'secondary'}`}>
                          {p.payment_status}
                        </span>
                      </td>
                      <td>
                        {p.payment_status === 'Paid' && p.payment_method === 'Online' && (
                          <button
                            className="btn btn-sm btn-outline-danger rounded-pill px-2"
                            onClick={() => handleRefund(p.booking_id)}
                            disabled={refunding === p.booking_id}
                            title="Initiate Refund"
                          >
                            {refunding === p.booking_id ? <span className="spinner-border spinner-border-sm"></span> : <><i className="fas fa-undo me-1"></i>Refund</>}
                          </button>
                        )}
                        {p.payment_status === 'Refunded' && (
                          <span className="text-info small fw-bold"><i className="fas fa-check-circle me-1"></i>Refunded</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan="9" className="text-center py-5 text-muted">No payment records found.</td></tr>
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

export default AdminPaymentsPage;


