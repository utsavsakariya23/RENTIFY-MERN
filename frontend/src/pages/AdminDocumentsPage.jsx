import React, { useState, useEffect } from 'react';
import API from '../services/api';

const AdminDocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data } = await API.get('/documents/admin/all');
      setDocuments(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const verifyDoc = async (id, type, status) => {
    try {
      await API.put(`/documents/admin/${id}/verify`, { type, status });
      setAlert({ type: 'success', msg: `Document marked as ${status}` });
      fetchDocuments();
    } catch (err) {
      setAlert({ type: 'danger', msg: 'Failed to update status' });
    }
  };

  const getBadgeClass = (status) => {
    switch (status) {
      case 'Verified': return 'bg-success';
      case 'Pending': return 'bg-warning text-dark';
      case 'Rejected': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  if (loading) return <div className="container py-5 mt-5 text-center"><div className="spinner-border text-primary"></div></div>;

  return (
    <main className="container-fluid my-5 pt-5 px-md-5">
      <div className="row mt-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold text-dark mb-0">Document Management</h2>
              <p className="text-muted small">Verify user identities and driving licenses</p>
            </div>
            <button onClick={fetchDocuments} className="btn btn-primary rounded-pill px-4 shadow-sm">
              <i className="fas fa-sync-alt me-2"></i>Refresh
            </button>
          </div>

          {alert && (
            <div className={`alert alert-${alert.type} alert-dismissible fade show rounded-3 shadow-sm border-0 mb-4`}>
              {alert.msg}
              <button type="button" className="btn-close" onClick={() => setAlert(null)}></button>
            </div>
          )}

          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="border-0 text-muted small fw-bold text-uppercase py-3">Customer</th>
                    <th className="border-0 text-muted small fw-bold text-uppercase py-3">Government ID</th>
                    <th className="border-0 text-muted small fw-bold text-uppercase py-3">Driving License</th>
                    <th className="border-0 text-muted small fw-bold text-uppercase py-3">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.document_id}>
                      <td>
                        <div className="fw-bold">{doc.user?.name}</div>
                        <div className="text-muted small">{doc.user?.email}</div>
                      </td>
                      <td>
                        {doc.gov_id_url ? (
                          <div className="d-flex flex-column gap-2">
                            <a href={doc.gov_id_url} target="_blank" rel="noreferrer" className="d-block">
                              <img src={doc.gov_id_url} alt="Gov ID" className="img-thumbnail" style={{width:'100px', height:'60px', objectFit:'cover'}} />
                            </a>
                            <span className={`badge ${getBadgeClass(doc.gov_id_status)} rounded-pill`}>{doc.gov_id_status}</span>
                            {doc.gov_id_status === 'Pending' && (
                              <div className="d-flex gap-1">
                                <button className="btn btn-xs btn-success py-0 px-2 small" onClick={() => verifyDoc(doc.document_id, 'gov_id', 'Verified')}>Verify</button>
                                <button className="btn btn-xs btn-danger py-0 px-2 small" onClick={() => verifyDoc(doc.document_id, 'gov_id', 'Rejected')}>Reject</button>
                              </div>
                            )}
                          </div>
                        ) : <span className="text-muted italic">Not Uploaded</span>}
                      </td>
                      <td>
                        {doc.license_url ? (
                          <div className="d-flex flex-column gap-2">
                            <a href={doc.license_url} target="_blank" rel="noreferrer" className="d-block">
                              <img src={doc.license_url} alt="License" className="img-thumbnail" style={{width:'100px', height:'60px', objectFit:'cover'}} />
                            </a>
                            <span className={`badge ${getBadgeClass(doc.license_status)} rounded-pill`}>{doc.license_status}</span>
                            {doc.license_status === 'Pending' && (
                              <div className="d-flex gap-1">
                                <button className="btn btn-xs btn-success py-0 px-2 small" onClick={() => verifyDoc(doc.document_id, 'license', 'Verified')}>Verify</button>
                                <button className="btn btn-xs btn-danger py-0 px-2 small" onClick={() => verifyDoc(doc.document_id, 'license', 'Rejected')}>Reject</button>
                              </div>
                            )}
                          </div>
                        ) : <span className="text-muted italic">Not Uploaded</span>}
                      </td>
                      <td className="text-muted small">
                        {new Date(doc.updatedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {documents.length === 0 && (
                    <tr><td colSpan="4" className="text-center py-5 text-muted">No documents found.</td></tr>
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

export default AdminDocumentsPage;
