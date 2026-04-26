import React, { useState, useEffect } from 'react';
import API from '../services/api';

const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponToSend, setCouponToSend] = useState(null);
  const [sendTarget, setSendTarget] = useState({ type: 'Specific', email: '' });
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ code: '', discount_percent: '', expiry_date: '', is_active: true, assigned_user_email: '', max_uses: 1, show_in_suggestions: false });
  const [alert, setAlert] = useState(null);

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    try {
      const { data } = await API.get('/admin/coupons');
      setCoupons(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCoupon) {
        await API.put(`/admin/coupons/${editingCoupon.coupon_id}`, form);
        setAlert({ type: 'success', msg: 'Coupon updated successfully.' });
      } else {
        await API.post('/admin/coupons', form);
        setAlert({ type: 'success', msg: 'Coupon created successfully.' });
      }
      setShowModal(false);
      setEditingCoupon(null);
      setForm({ code: '', discount_percent: '', expiry_date: '', is_active: true, assigned_user_email: '', max_uses: 1, show_in_suggestions: false });
      fetchCoupons();
    } catch (err) {
      setAlert({ type: 'danger', msg: 'Failed to save coupon.' });
    }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await API.delete(`/admin/coupons/${id}`);
      setAlert({ type: 'success', msg: 'Coupon deleted.' });
      fetchCoupons();
    } catch (err) {
      setAlert({ type: 'danger', msg: 'Failed to delete coupon.' });
    }
  };

  const openEdit = (c) => {
    setEditingCoupon(c);
    setForm({ 
      code: c.code, discount_percent: c.discount_percent, 
      expiry_date: c.expiry_date?.split('T')[0] || '', is_active: c.is_active,
      assigned_user_email: c.assigned_user_email || '', max_uses: c.max_uses || 1, show_in_suggestions: c.show_in_suggestions || false
    });
    setShowModal(true);
  };

  const handleSendCoupon = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const { data } = await API.post(`/admin/coupons/${couponToSend.coupon_id}/send`, { 
        targetType: sendTarget.type, 
        targetEmail: sendTarget.email 
      });
      setAlert({ type: 'success', msg: data.message });
      setShowSendModal(false);
      setSendTarget({ type: 'Specific', email: '' });
      fetchCoupons(); // refresh to show assigned user
    } catch (err) {
      setAlert({ type: 'danger', msg: err.response?.data?.message || 'Failed to send coupon' });
    }
    setSending(false);
  };

  if (loading) return <div className="container py-5 mt-5 text-center"><div className="spinner-border text-primary"></div></div>;

  return (
    <main className="container-fluid my-5 pt-5 px-md-5">
      <div className="row mt-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold text-dark mb-0">Coupons</h2>
              <p className="text-muted small">Manage discount coupon codes</p>
            </div>
            <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" onClick={() => { setEditingCoupon(null); setForm({ code: '', discount_percent: '', expiry_date: '', is_active: true, assigned_user_email: '', max_uses: 1, show_in_suggestions: false }); setShowModal(true); }}>
              <i className="fas fa-plus me-2"></i>ADD COUPON
            </button>
          </div>

          {alert && (
            <div className={`alert alert-${alert.type} alert-dismissible`}>
              {alert.msg}
              <button type="button" className="btn-close" onClick={() => setAlert(null)}></button>
            </div>
          )}

          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    {['#', 'Code', 'Discount', 'Expiry Date', 'Status', 'Actions'].map(h => (
                      <th key={h} className="border-0 text-muted small fw-bold text-uppercase py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.coupon_id}>
                      <td className="ps-3 text-muted">#{c.coupon_id}</td>
                      <td><code className="bg-light rounded px-2 py-1 fw-bold">{c.code}</code></td>
                      <td><span className="badge bg-primary rounded-pill px-3">{c.discount_percent}% OFF</span></td>
                      <td className="text-muted small">{c.expiry_date ? new Date(c.expiry_date).toLocaleDateString('en-IN') : '—'}</td>
                      <td>
                        <span className={`badge rounded-pill px-3 ${c.is_active ? 'bg-success' : 'bg-secondary'}`}>
                          {c.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button className="btn btn-light btn-sm rounded-circle border shadow-sm" onClick={() => { setCouponToSend(c); setShowSendModal(true); }} title="Send via Email">
                            <i className="fas fa-paper-plane text-info"></i>
                          </button>
                          <button className="btn btn-light btn-sm rounded-circle border shadow-sm" onClick={() => openEdit(c)} title="Edit">
                            <i className="fas fa-edit text-primary"></i>
                          </button>
                          <button className="btn btn-light btn-sm rounded-circle border shadow-sm" onClick={() => deleteCoupon(c.coupon_id)} title="Delete">
                            <i className="fas fa-trash text-danger"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {coupons.length === 0 && (
                    <tr><td colSpan="6" className="text-center py-5 text-muted">No coupons created yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header border-0 p-4">
                <h5 className="modal-title fw-bold">{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4 pt-0">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">COUPON CODE</label>
                    <input type="text" className="form-control bg-light border-0" placeholder="e.g. SAVE20" value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">DISCOUNT (%)</label>
                    <input type="number" min="1" max="100" className="form-control bg-light border-0" placeholder="e.g. 20" value={form.discount_percent} onChange={e => setForm({...form, discount_percent: e.target.value})} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">EXPIRY DATE</label>
                    <input type="date" className="form-control bg-light border-0" value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})} />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">MAX USES PER USER</label>
                      <input type="number" min="1" className="form-control bg-light border-0" value={form.max_uses} onChange={e => setForm({...form, max_uses: parseInt(e.target.value)})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">ASSIGN TO USER (EMAIL)</label>
                      <input type="email" className="form-control bg-light border-0" placeholder="Optional" value={form.assigned_user_email} onChange={e => setForm({...form, assigned_user_email: e.target.value})} />
                    </div>
                  </div>
                  <div className="d-flex gap-4 mb-2">
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" id="isActive" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} />
                      <label className="form-check-label fw-bold" htmlFor="isActive">Active</label>
                    </div>
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" id="show_in_suggestions" checked={form.show_in_suggestions} onChange={e => setForm({...form, show_in_suggestions: e.target.checked})} />
                      <label className="form-check-label fw-bold" htmlFor="show_in_suggestions">Suggest in checkout</label>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 p-4 pt-0">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary rounded-pill px-5 fw-bold">{editingCoupon ? 'UPDATE' : 'CREATE'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Send Coupon Modal */}
      {showSendModal && couponToSend && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header border-0 p-4 pb-0">
                <h5 className="modal-title fw-bold">Send Coupon: {couponToSend.code}</h5>
                <button type="button" className="btn-close" onClick={() => setShowSendModal(false)}></button>
              </div>
              <form onSubmit={handleSendCoupon}>
                <div className="modal-body p-4">
                  <p className="text-muted small mb-3">
                    Who do you want to send this coupon to?
                  </p>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">TARGET AUDIENCE</label>
                    <select className="form-select bg-light border-0 py-2" value={sendTarget.type} onChange={e => setSendTarget(prev => ({ ...prev, type: e.target.value }))}>
                      <option value="Specific">Specific User (Email)</option>
                      <option value="All">All Users</option>
                      <option value="MoreThan3">Users with &gt;3 Bookings</option>
                      <option value="Zero">Users with 0 Bookings</option>
                    </select>
                  </div>
                  {sendTarget.type === 'Specific' && (
                    <div>
                      <label className="form-label small fw-bold text-muted">CUSTOMER EMAIL</label>
                      <input type="email" className="form-control bg-light border-0 py-2" placeholder="user@example.com" value={sendTarget.email} onChange={e => setSendTarget(prev => ({ ...prev, email: e.target.value }))} required />
                    </div>
                  )}
                </div>
                <div className="modal-footer border-0 p-4 pt-0 gap-2">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowSendModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold" disabled={sending}>
                    {sending ? <><span className="spinner-border spinner-border-sm me-2"></span>Sending...</> : <><i className="fas fa-paper-plane me-2"></i>Send Offer</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminCouponsPage;
