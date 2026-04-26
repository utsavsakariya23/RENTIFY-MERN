import React, { useState, useEffect } from 'react';
import API from '../services/api';

const EXPENSE_TYPES = ['Maintenance', 'Salary', 'Insurance', 'Marketing', 'Utilities', 'Office', 'Fuel', 'Other'];

const AdminBusinessPage = () => {
  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [alert, setAlert] = useState(null);
  const [form, setForm] = useState({ expense_type: 'Maintenance', description: '', amount: '', expense_date: '', receipt_url: '', admin_notes: '' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [sumRes, expRes] = await Promise.all([API.get('/expenses/summary'), API.get('/expenses')]);
      setSummary(sumRes.data);
      setExpenses(expRes.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const showAlert = (type, msg) => { setAlert({ type, msg }); setTimeout(() => setAlert(null), 4000); };

  const openModal = (exp = null) => {
    setEditing(exp);
    setForm(exp ? { expense_type: exp.expense_type, description: exp.description, amount: exp.amount, expense_date: exp.expense_date, receipt_url: exp.receipt_url || '', admin_notes: exp.admin_notes || '' }
      : { expense_type: 'Maintenance', description: '', amount: '', expense_date: new Date().toISOString().split('T')[0], receipt_url: '', admin_notes: '' });
    setShowModal(true);
  };

  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'rentifymern');
      fd.append('folder', 'rentify_receipts');
      const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.secure_url) setForm(prev => ({ ...prev, receipt_url: data.secure_url }));
    } catch (err) { showAlert('danger', 'Receipt upload failed'); }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await API.put(`/expenses/${editing.expense_id}`, form); showAlert('success', 'Expense updated.'); }
      else { await API.post('/expenses', form); showAlert('success', 'Expense added.'); }
      setShowModal(false);
      fetchAll();
    } catch (err) { showAlert('danger', 'Failed to save expense.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try { await API.delete(`/expenses/${id}`); showAlert('success', 'Deleted.'); fetchAll(); }
    catch (err) { showAlert('danger', 'Failed to delete.'); }
  };

  if (loading) return <div className="container py-5 mt-5 text-center"><div className="spinner-border text-primary"></div></div>;

  const months = summary?.monthlyRevenue ? Object.keys(summary.monthlyRevenue).slice(-6) : [];
  const revenues = months.map(m => summary.monthlyRevenue[m]);
  const maxRev = Math.max(...revenues, 1);

  return (
    <main className="container-fluid my-5 pt-5 px-md-5">
      <div className="row mt-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <div>
              <h2 className="fw-bold text-dark mb-0">Business Management</h2>
              <p className="text-muted small">Revenue, expenses, and financial overview</p>
            </div>
            <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" onClick={() => openModal()}>
              <i className="fas fa-plus me-2"></i>Add Expense
            </button>
          </div>

          {alert && <div className={`alert alert-${alert.type} alert-dismissible rounded-3 mb-4`}>{alert.msg}<button className="btn-close" onClick={() => setAlert(null)}></button></div>}

          {/* KPI Cards */}
          {summary && (
            <div className="row g-3 mb-5">
              {[
                { label: 'Total Revenue', value: `Rs. ${parseFloat(summary.totalRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: 'fas fa-rupee-sign', color: 'success', sub: 'From paid bookings' },
                { label: 'GST Collected (18%)', value: `Rs. ${parseFloat(summary.gstCollected || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: 'fas fa-file-invoice', color: 'info', sub: 'Govt. tax liability' },
                { label: 'Total Expenses', value: `Rs. ${parseFloat(summary.totalExpenses || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: 'fas fa-receipt', color: 'danger', sub: 'All recorded expenses' },
                { label: 'Net Profit', value: `Rs. ${parseFloat(summary.netProfit || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: 'fas fa-chart-line', color: summary.netProfit >= 0 ? 'success' : 'danger', sub: 'Revenue − GST − Expenses' },
              ].map(c => (
                <div className="col-md-3" key={c.label}>
                  <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className={`bg-${c.color} bg-opacity-10 rounded-3 p-3`}><i className={`${c.icon} text-${c.color} fa-lg`}></i></div>
                    </div>
                    <div className={`fs-4 fw-bold text-${c.color}`}>{c.value}</div>
                    <div className="text-muted small fw-bold">{c.label}</div>
                    <div className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>{c.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="row g-4 mb-5">
            {/* Monthly Revenue Chart */}
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                <h5 className="fw-bold mb-4">Monthly Revenue Trend</h5>
                {months.length === 0 ? <p className="text-muted">No revenue data yet.</p> : (
                  <div className="d-flex align-items-end gap-3" style={{ height: '200px' }}>
                    {months.map((month, i) => (
                      <div key={month} className="d-flex flex-column align-items-center flex-grow-1">
                        <div className="small text-muted mb-1" style={{ fontSize: '0.7rem' }}>Rs. {Math.round(revenues[i]).toLocaleString()}</div>
                        <div className="rounded-3 w-100 bg-primary bg-opacity-75" style={{ height: `${Math.max((revenues[i] / maxRev) * 180, 10)}px`, transition: 'height 0.5s', minWidth: '30px' }}></div>
                        <div className="small mt-2 text-muted fw-bold" style={{ fontSize: '0.75rem' }}>{month}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Expense Type Breakdown */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                <h5 className="fw-bold mb-4">Expense Breakdown</h5>
                {expenses.length === 0 ? <p className="text-muted small">No expenses recorded.</p> : (() => {
                  const byType = {};
                  expenses.forEach(e => { byType[e.expense_type] = (byType[e.expense_type] || 0) + parseFloat(e.amount || 0); });
                  const total = Object.values(byType).reduce((s, v) => s + v, 0);
                  const colors = ['primary', 'success', 'danger', 'warning', 'info', 'secondary'];
                  return Object.entries(byType).map(([type, amt], i) => (
                    <div key={type} className="mb-3">
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="fw-bold">{type}</span>
                        <span className="text-muted">Rs. {amt.toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({total ? Math.round((amt / total) * 100) : 0}%)</span>
                      </div>
                      <div className="progress rounded-pill" style={{ height: '8px' }}>
                        <div className={`progress-bar bg-${colors[i % colors.length]} rounded-pill`} style={{ width: `${total ? (amt / total) * 100 : 0}%` }}></div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>

          {/* Expense Table */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Expense Ledger</h5>
              <span className="badge bg-light text-dark border">{expenses.length} records</span>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    {['Date', 'Type', 'Description', 'Amount', 'Receipt', 'Notes', 'Actions'].map(h => (
                      <th key={h} className="border-0 text-muted small fw-bold text-uppercase py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(e => (
                    <tr key={e.expense_id}>
                      <td className="text-muted small">{e.expense_date}</td>
                      <td><span className="badge bg-light text-dark border">{e.expense_type}</span></td>
                      <td className="small">{e.description}</td>
                      <td className="fw-bold text-danger">Rs. {parseFloat(e.amount).toLocaleString()}</td>
                      <td>{e.receipt_url ? <a href={e.receipt_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-light border rounded-pill"><i className="fas fa-file-image me-1 text-primary"></i>View</a> : <span className="text-muted small">—</span>}</td>
                      <td className="small text-muted">{e.admin_notes?.substring(0, 40) || '—'}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button className="btn btn-light btn-sm rounded-circle border shadow-sm" onClick={() => openModal(e)}><i className="fas fa-edit text-primary"></i></button>
                          <button className="btn btn-light btn-sm rounded-circle border shadow-sm" onClick={() => handleDelete(e.expense_id)}><i className="fas fa-trash text-danger"></i></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {expenses.length === 0 && <tr><td colSpan="7" className="text-center py-5 text-muted">No expenses recorded yet. Add your first expense.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Expense Modal */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header border-0 p-4">
                <h5 className="modal-title fw-bold">{editing ? 'Edit Expense' : 'Add Expense'}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4 pt-0">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">TYPE</label>
                      <select className="form-select bg-light border-0" value={form.expense_type} onChange={e => setForm({ ...form, expense_type: e.target.value })}>
                        {EXPENSE_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">DATE</label>
                      <input type="date" className="form-control bg-light border-0" value={form.expense_date} onChange={e => setForm({ ...form, expense_date: e.target.value })} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold text-muted">DESCRIPTION</label>
                      <input type="text" className="form-control bg-light border-0" placeholder="Brief description of expense" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">AMOUNT (Rs.)</label>
                      <input type="number" min="0" step="0.01" className="form-control bg-light border-0" placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">RECEIPT (optional)</label>
                      <div className="position-relative">
                        <button type="button" className="btn btn-light border w-100 rounded-3 text-start" disabled={uploading}>
                          {uploading ? <><span className="spinner-border spinner-border-sm me-2"></span>Uploading...</> : <><i className="fas fa-paperclip me-2 text-primary"></i>{form.receipt_url ? '✓ Receipt Attached' : 'Upload Receipt'}</>}
                        </button>
                        <input type="file" accept="image/*" className="position-absolute top-0 start-0 opacity-0 w-100 h-100" style={{ cursor: 'pointer' }} onChange={handleReceiptUpload} />
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold text-muted">NOTES (optional)</label>
                      <textarea className="form-control bg-light border-0" rows="2" value={form.admin_notes} onChange={e => setForm({ ...form, admin_notes: e.target.value })}></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 p-4 pt-0 gap-2">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary rounded-pill px-5 fw-bold">{editing ? 'Update' : 'Add'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminBusinessPage;
