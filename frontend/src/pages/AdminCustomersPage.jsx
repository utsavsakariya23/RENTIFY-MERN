import React, { useState, useEffect } from 'react';
import API from '../services/api';

const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewCustomer, setViewCustomer] = useState(null);
  const [alert, setAlert] = useState(null);

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    try {
      const { data } = await API.get('/admin/customers');
      setCustomers(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const deleteCustomer = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this customer account? This action cannot be undone.')) return;
    try {
      await API.delete(`/admin/customers/${id}`);
      setCustomers(customers.filter(c => c.user_id !== id));
      setAlert({ type: 'success', msg: 'Customer deleted successfully.' });
      if (viewCustomer && viewCustomer.user_id === id) setViewCustomer(null);
    } catch (err) {
      setAlert({ type: 'danger', msg: err.response?.data?.message || 'Failed to delete customer.' });
    }
  };

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="container py-5 mt-5 text-center"><div className="spinner-border text-primary"></div></div>;

  return (
    <main className="container-fluid my-5 pt-5 px-md-5">
      <div className="row mt-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold text-dark mb-0">Customers</h2>
              <p className="text-muted small">Manage all registered users</p>
            </div>
            <div className="d-flex gap-2">
              <div className="input-group" style={{ maxWidth: '280px' }}>
                <span className="input-group-text bg-light border-0"><i className="fas fa-search text-muted"></i></span>
                <input type="text" className="form-control bg-light border-0" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
          </div>

          {alert && (
            <div className={`alert alert-${alert.type} alert-dismissible fade show rounded-3 mb-4`} role="alert">
              {alert.msg}
              <button type="button" className="btn-close" onClick={() => setAlert(null)}></button>
            </div>
          )}

          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="border-0 text-muted small fw-bold text-uppercase ps-4">#</th>
                    <th className="border-0 text-muted small fw-bold text-uppercase">Customer</th>
                    <th className="border-0 text-muted small fw-bold text-uppercase">Email</th>
                    <th className="border-0 text-muted small fw-bold text-uppercase">Phone</th>
                    <th className="border-0 text-muted small fw-bold text-uppercase">Role</th>
                    <th className="border-0 text-muted small fw-bold text-uppercase">Joined</th>
                    <th className="border-0 text-muted small fw-bold text-uppercase text-center pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.user_id}>
                      <td className="ps-4 text-muted">#{c.user_id}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3 fw-bold text-primary" style={{ width: '40px', height: '40px', fontSize: '16px' }}>
                            {c.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="fw-bold">{c.name}</span>
                        </div>
                      </td>
                      <td className="text-muted">{c.email}</td>
                      <td className="text-muted">{c.phone_number || '—'}</td>
                      <td>
                        <span className={`badge rounded-pill px-3 py-2 ${c.role === 'Admin' ? 'bg-danger' : 'bg-success'}`}>{c.role}</span>
                      </td>
                      <td className="text-muted small">{new Date(c.created_at).toLocaleDateString('en-IN')}</td>
                      <td className="text-center pe-4">
                        <div className="d-flex gap-2 justify-content-center">
                          <button className="btn btn-light btn-sm rounded-circle border shadow-sm" onClick={() => setViewCustomer(c)} title="View Detail">
                            <i className="fas fa-eye text-primary"></i>
                          </button>
                          <button className="btn btn-light btn-sm rounded-circle border shadow-sm" onClick={() => deleteCustomer(c.user_id)} title="Delete Customer">
                            <i className="fas fa-trash text-danger"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan="7" className="text-center py-5 text-muted">No customers found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {viewCustomer && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header border-0 p-4">
                <h5 className="modal-title fw-bold">Customer Details</h5>
                <button type="button" className="btn-close" onClick={() => setViewCustomer(null)}></button>
              </div>
              <div className="modal-body p-4 pt-0">
                <div className="text-center mb-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 fw-bold text-primary fs-2" style={{ width: '80px', height: '80px' }}>
                    {viewCustomer.name?.charAt(0).toUpperCase()}
                  </div>
                  <h5 className="fw-bold mb-0">{viewCustomer.name}</h5>
                  <span className={`badge rounded-pill px-3 py-2 ${viewCustomer.role === 'Admin' ? 'bg-danger' : 'bg-success'}`}>{viewCustomer.role}</span>
                </div>
                <div className="list-group list-group-flush">
                  {[
                    { icon: 'fas fa-envelope', label: 'Email', value: viewCustomer.email },
                    { icon: 'fas fa-phone', label: 'Phone', value: viewCustomer.phone_number || 'Not provided' },
                    { icon: 'fas fa-map-marker-alt', label: 'Address', value: viewCustomer.address || 'Not provided' },
                    { icon: 'fas fa-calendar', label: 'Joined', value: new Date(viewCustomer.created_at).toLocaleDateString('en-IN') },
                  ].map(item => (
                    <div key={item.label} className="list-group-item border-0 px-0 py-2 d-flex align-items-center">
                      <i className={`${item.icon} text-primary me-3 w-20`}></i>
                      <div>
                        <div className="text-muted small">{item.label}</div>
                        <div className="fw-bold small">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer border-0 p-4 pt-0 gap-2">
                <button className="btn btn-danger rounded-pill px-4" onClick={() => deleteCustomer(viewCustomer.user_id)}>
                  <i className="fas fa-trash me-2"></i>Delete Customer
                </button>
                <button className="btn btn-light rounded-pill px-4" onClick={() => setViewCustomer(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminCustomersPage;
