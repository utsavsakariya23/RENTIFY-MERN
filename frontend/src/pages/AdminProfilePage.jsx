import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminProfilePage = () => {
  const { userInfo } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone_number: '', address: '', currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (userInfo) {
      setForm(prev => ({ ...prev, name: userInfo.name || '', email: userInfo.email || '' }));
    }
    const fetchProfile = async () => {
      try {
        const { data } = await API.get('/auth/profile');
        setForm(prev => ({ ...prev, name: data.name, email: data.email, phone_number: data.phone_number || '', address: data.address || '' }));
      } catch (err) { console.error(err); }
    };
    fetchProfile();
  }, [userInfo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword) {
      if (form.newPassword !== form.confirmPassword) {
        setAlert({ type: 'danger', msg: 'New passwords do not match.' });
        return;
      }
      if (form.newPassword.length < 6) {
        setAlert({ type: 'danger', msg: 'New password must be at least 6 characters.' });
        return;
      }
    }
    setLoading(true);
    try {
      await API.put('/auth/profile', { name: form.name, phone_number: form.phone_number, address: form.address, currentPassword: form.currentPassword || undefined, newPassword: form.newPassword || undefined });
      setAlert({ type: 'success', msg: 'Profile updated successfully.' });
      setForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (err) {
      setAlert({ type: 'danger', msg: err.response?.data?.message || 'Failed to update profile.' });
    }
    setLoading(false);
  };

  return (
    <main className="container-fluid my-5 pt-5 px-md-5">
      <div className="row mt-4 justify-content-center">
        <div className="col-lg-8">
          <div className="d-flex align-items-center mb-4">
            <div className="bg-primary bg-opacity-10 rounded-3 p-3 me-3">
              <i className="fas fa-user-shield text-primary fa-lg"></i>
            </div>
            <div>
              <h2 className="fw-bold mb-0">Admin Profile</h2>
              <p className="text-muted small mb-0">Manage your administrator account</p>
            </div>
          </div>

          {alert && (
            <div className={`alert alert-${alert.type} alert-dismissible`}>
              {alert.msg}
              <button type="button" className="btn-close" onClick={() => setAlert(null)}></button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
              <h5 className="fw-bold mb-4">Personal Information</h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">FULL NAME</label>
                  <input type="text" className="form-control bg-light border-0" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">EMAIL</label>
                  <input type="email" className="form-control bg-light border-0" value={form.email} disabled />
                  <small className="text-muted">Email cannot be changed.</small>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">PHONE NUMBER</label>
                  <input type="tel" className="form-control bg-light border-0" value={form.phone_number} onChange={e => setForm({...form, phone_number: e.target.value})} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">ADDRESS</label>
                  <input type="text" className="form-control bg-light border-0" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
              <h5 className="fw-bold mb-4">Change Password <span className="text-muted small fw-normal">(leave blank to keep current)</span></h5>
              <div className="row g-3">
                <div className="col-md-12">
                  <label className="form-label small fw-bold text-muted">CURRENT PASSWORD</label>
                  <input type="password" className="form-control bg-light border-0" value={form.currentPassword} onChange={e => setForm({...form, currentPassword: e.target.value})} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">NEW PASSWORD</label>
                  <input type="password" className="form-control bg-light border-0" value={form.newPassword} onChange={e => setForm({...form, newPassword: e.target.value})} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">CONFIRM NEW PASSWORD</label>
                  <input type="password" className="form-control bg-light border-0" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="text-end">
              <button type="submit" className="btn btn-primary rounded-pill px-5 fw-bold shadow-sm" disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : <><i className="fas fa-save me-2"></i>Save Changes</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default AdminProfilePage;
