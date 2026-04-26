import React, { useState, useEffect } from 'react';
import API from '../services/api';

const AdminCityPointsPage = () => {
  const [cityPoints, setCityPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ cityName: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCityPoints();
  }, []);

  const fetchCityPoints = async () => {
    try {
      const { data } = await API.get('/citypoints');
      setCityPoints(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'danger', text: 'Failed to fetch city points' });
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.cityName.trim()) newErrors.cityName = 'City name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      await API.post('/citypoints', formData);
      setMessage({ type: 'success', text: 'City added successfully!' });
      setFormData({ cityName: '' });
      fetchCityPoints();
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to add city' });
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this city?')) return;

    try {
      await API.delete(`/citypoints/${id}`);
      setMessage({ type: 'success', text: 'City deleted successfully!' });
      fetchCityPoints();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Failed to delete city' });
    }
  };

  return (
    <div className="container-fluid p-4 mt-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">City Management</h2>
          <p className="text-muted small">Add and manage cities where your service is active</p>
        </div>
        <div className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
          <i className="fas fa-city me-2"></i>
          {cityPoints.length} Cities Total
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show rounded-4 shadow-sm mb-4`} role="alert">
          <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2`}></i>
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
        </div>
      )}

      <div className="row g-4">
        {/* Add New City Form */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white py-3 border-bottom border-light">
              <h5 className="fw-bold mb-0">Add New City</h5>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">City Name</label>
                  <input
                    type="text"
                    className={`form-control bg-light border-0 p-3 rounded-3 ${errors.cityName ? 'is-invalid' : ''}`}
                    placeholder="e.g. New York"
                    value={formData.cityName}
                    onChange={(e) => setFormData({ ...formData, cityName: e.target.value })}
                  />
                  {errors.cityName && <div className="invalid-feedback">{errors.cityName}</div>}
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100 py-3 fw-bold rounded-pill shadow-sm"
                  disabled={submitting}
                >
                  {submitting ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Adding...</>
                  ) : (
                    <><i className="fas fa-plus-circle me-2"></i>Add Point</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Cities List */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white py-3 border-bottom border-light d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Cities List</h5>
              <div className="input-group w-auto">
                <span className="input-group-text bg-light border-0"><i className="fas fa-search text-muted"></i></span>
                <input type="text" className="form-control bg-light border-0 small" placeholder="Search cities..." />
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="px-4 py-3 border-0 small fw-bold text-muted text-uppercase w-100">City Name</th>
                      <th className="px-4 py-3 border-0 small fw-bold text-muted text-uppercase text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="3" className="text-center py-5">
                          <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                          <span className="text-muted">Loading points...</span>
                        </td>
                      </tr>
                    ) : cityPoints.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center py-5 text-muted">
                          <i className="fas fa-map-marker-alt fa-3x mb-3 d-block opacity-25"></i>
                          No city points found. Add one to get started.
                        </td>
                      </tr>
                    ) : (
                      cityPoints.map((point) => (
                        <tr key={point.city_point_id}>
                          <td className="px-4 py-3">
                            <span className="fw-bold text-dark">{point.city_name}</span>
                          </td>
                          <td className="px-4 py-3 text-end">
                            <button
                              className="btn btn-sm btn-outline-danger rounded-circle border-0"
                              onClick={() => handleDelete(point.city_point_id)}
                              title="Delete"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCityPointsPage;
