import React, { useState, useEffect } from 'react';
import API from '../services/api';

const TYPES = ['General', 'Engine', 'Tyre', 'Electrical', 'Body', 'AC', 'Brakes', 'Other'];
const STATUSES = ['Scheduled', 'In Progress', 'Completed'];

const AdminMaintenancePage = () => {
  const [records, setRecords] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [alert, setAlert] = useState(null);
  const [form, setForm] = useState({
    car_id: '', issue_description: '', maintenance_type: 'General',
    scheduled_date: '', completed_date: '', next_maintenance_date: '', cost: '', status: 'Scheduled', technician_notes: ''
  });

  useEffect(() => {
    fetchAll();
    fetchCars();
  }, []);

  const fetchAll = async () => {
    try {
      const { data } = await API.get('/maintenance');
      setRecords(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchCars = async () => {
    try {
      const { data } = await API.get('/cars');
      setCars(data);
    } catch (err) {}
  };

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 4000);
  };

  const openModal = (record = null) => {
    setEditing(record);
    setForm(record ? {
      car_id: record.car_id, issue_description: record.issue_description,
      maintenance_type: record.maintenance_type, scheduled_date: record.scheduled_date?.split('T')[0] || '',
      completed_date: record.completed_date?.split('T')[0] || '',
      next_maintenance_date: record.next_maintenance_date?.split('T')[0] || '',
      cost: record.cost, status: record.status, technician_notes: record.technician_notes || ''
    } : { car_id: '', issue_description: '', maintenance_type: 'General', scheduled_date: '', completed_date: '', next_maintenance_date: '', cost: '', status: 'Scheduled', technician_notes: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await API.put(`/maintenance/${editing.maintenance_id}`, form);
        showAlert('success', 'Record updated successfully.');
      } else {
        await API.post('/maintenance', form);
        showAlert('success', 'Maintenance record created.');
      }
      setShowModal(false);
      fetchAll();
    } catch (err) { showAlert('danger', 'Failed to save record.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this maintenance record?')) return;
    try {
      await API.delete(`/maintenance/${id}`);
      showAlert('success', 'Record deleted.');
      fetchAll();
    } catch (err) { showAlert('danger', 'Failed to delete.'); }
  };

  const statusColor = { Scheduled: 'warning text-dark', 'In Progress': 'primary', Completed: 'success' };
  const filtered = filterStatus === 'All' ? records : records.filter(r => r.status === filterStatus);
  const totalCost = records.filter(r => r.status === 'Completed').reduce((s, r) => s + parseFloat(r.cost || 0), 0);

  if (loading) return <div className="container py-5 mt-5 text-center"><div className="spinner-border text-primary"></div></div>;

  return (
    <main className="container-fluid my-5 pt-5 px-md-5">
      <div className="row mt-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <div>
              <h2 className="fw-bold text-dark mb-0">Fleet Maintenance</h2>
              <p className="text-muted small">Track and manage vehicle maintenance records</p>
            </div>
            <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" onClick={() => openModal()}>
              <i className="fas fa-plus me-2"></i>Add Record
            </button>
          </div>

          {alert && <div className={`alert alert-${alert.type} alert-dismissible rounded-3`}>{alert.msg}<button className="btn-close" onClick={() => setAlert(null)}></button></div>}

          {/* Summary Cards */}
          <div className="row g-3 mb-4">
            {[
              { label: 'Total Records', value: records.length, icon: 'fas fa-wrench', color: 'primary' },
              { label: 'Scheduled', value: records.filter(r => r.status === 'Scheduled').length, icon: 'fas fa-clock', color: 'warning' },
              { label: 'In Progress', value: records.filter(r => r.status === 'In Progress').length, icon: 'fas fa-spinner', color: 'info' },
              { label: 'Completed (Cost)', value: `Rs. ${totalCost.toLocaleString()}`, icon: 'fas fa-check-circle', color: 'success' },
            ].map(c => (
              <div className="col-md-3" key={c.label}>
                <div className="card border-0 shadow-sm rounded-4 p-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div><div className="text-muted small mb-1">{c.label}</div><div className={`fs-4 fw-bold text-${c.color}`}>{c.value}</div></div>
                    <div className={`bg-${c.color} bg-opacity-10 rounded-3 p-3`}><i className={`${c.icon} text-${c.color} fa-lg`}></i></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filter */}
          <div className="d-flex gap-2 mb-3">
            {['All', ...STATUSES].map(s => (
              <button key={s} className={`btn rounded-pill px-3 btn-sm fw-bold ${filterStatus === s ? 'btn-primary' : 'btn-light border'}`} onClick={() => setFilterStatus(s)}>{s}</button>
            ))}
          </div>

          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    {['#', 'Vehicle', 'Type', 'Issue', 'Scheduled', 'Cost', 'Status', 'Actions'].map(h => (
                      <th key={h} className="border-0 text-muted small fw-bold text-uppercase py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.maintenance_id}>
                      <td className="ps-3 text-muted">#{r.maintenance_id}</td>
                      <td><div className="fw-bold">{r.car?.brand} {r.car?.name}</div><div className="text-muted small">{r.car?.car_type}</div></td>
                      <td><span className="badge bg-light text-dark border">{r.maintenance_type}</span></td>
                      <td className="small" style={{ maxWidth: '200px' }}>{r.issue_description?.substring(0, 60)}{r.issue_description?.length > 60 ? '...' : ''}</td>
                      <td className="text-muted small">
                        <div><span className="fw-bold text-dark">Sch:</span> {r.scheduled_date}</div>
                        {r.next_maintenance_date && <div><span className="fw-bold text-primary">Next:</span> {r.next_maintenance_date}</div>}
                      </td>
                      <td className="fw-bold">Rs. {parseFloat(r.cost || 0).toLocaleString()}</td>
                      <td><span className={`badge rounded-pill px-3 bg-${statusColor[r.status]}`}>{r.status}</span></td>
                      <td>
                        <div className="d-flex gap-2">
                          <button className="btn btn-light btn-sm rounded-circle border shadow-sm" onClick={() => openModal(r)} title="Edit"><i className="fas fa-edit text-primary"></i></button>
                          <button className="btn btn-light btn-sm rounded-circle border shadow-sm" onClick={() => handleDelete(r.maintenance_id)} title="Delete"><i className="fas fa-trash text-danger"></i></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && <tr><td colSpan="8" className="text-center py-5 text-muted">No maintenance records found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header border-0 p-4">
                <h5 className="modal-title fw-bold">{editing ? 'Edit Maintenance Record' : 'Add Maintenance Record'}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4 pt-0">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">VEHICLE</label>
                      <select className="form-select bg-light border-0" value={form.car_id} onChange={e => setForm({ ...form, car_id: e.target.value })} required>
                        <option value="">Select Vehicle</option>
                        {cars.map(c => <option key={c.car_id} value={c.car_id}>{c.brand} {c.name}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">MAINTENANCE TYPE</label>
                      <select className="form-select bg-light border-0" value={form.maintenance_type} onChange={e => setForm({ ...form, maintenance_type: e.target.value })}>
                        {TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold text-muted">ISSUE DESCRIPTION</label>
                      <textarea className="form-control bg-light border-0" rows="2" placeholder="Describe the issue or maintenance needed..." value={form.issue_description} onChange={e => setForm({ ...form, issue_description: e.target.value })} required></textarea>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">SCHEDULED DATE</label>
                      <input type="date" className="form-control bg-light border-0" value={form.scheduled_date} onChange={e => setForm({ ...form, scheduled_date: e.target.value })} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">COMPLETED DATE</label>
                      <input type="date" className="form-control bg-light border-0" value={form.completed_date} onChange={e => setForm({ ...form, completed_date: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">NEXT REQUIRED DATE</label>
                      <input type="date" className="form-control bg-light border-0 text-primary fw-bold" value={form.next_maintenance_date} onChange={e => setForm({ ...form, next_maintenance_date: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">COST (Rs.)</label>
                      <input type="number" min="0" className="form-control bg-light border-0" placeholder="0" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">STATUS</label>
                      <select className="form-select bg-light border-0" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold text-muted">TECHNICIAN NOTES</label>
                      <textarea className="form-control bg-light border-0" rows="2" placeholder="Optional notes from the mechanic..." value={form.technician_notes} onChange={e => setForm({ ...form, technician_notes: e.target.value })}></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 p-4 pt-0 gap-2">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary rounded-pill px-5 fw-bold">{editing ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminMaintenancePage;
