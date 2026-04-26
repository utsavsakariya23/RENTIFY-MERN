import React, { useState, useEffect } from 'react';
import API from '../services/api';

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [expandedCar, setExpandedCar] = useState(null);

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    try {
      const { data } = await API.get('/admin/reviews');
      setReviews(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const showAlert = (type, msg) => { setAlert({ type, msg }); setTimeout(() => setAlert(null), 4000); };

  const deleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await API.delete(`/admin/reviews/${id}`);
      setReviews(prev => prev.filter(r => r.review_id !== id));
      showAlert('success', 'Review deleted.');
    } catch (err) { showAlert('danger', 'Failed to delete review.'); }
  };

  const toggleLike = async (id) => {
    try {
      const { data } = await API.put(`/admin/reviews/${id}/like`);
      setReviews(prev => prev.map(r => r.review_id === id ? { ...r, is_liked: data.is_liked } : r));
    } catch (err) { showAlert('danger', 'Failed to update like.'); }
  };

  const submitReply = async (id) => {
    if (!replyText.trim()) return;
    try {
      const { data } = await API.put(`/admin/reviews/${id}/reply`, { reply: replyText });
      setReviews(prev => prev.map(r => r.review_id === id ? { ...r, admin_reply: data.admin_reply } : r));
      setReplyingId(null);
      setReplyText('');
      showAlert('success', 'Reply posted.');
    } catch (err) { showAlert('danger', 'Failed to post reply.'); }
  };

  const renderStars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

  // Group reviews by car
  const groupedByCar = {};
  reviews.forEach(r => {
    const carKey = r.car_id || 'unknown';
    const carLabel = `${r.car?.brand || ''} ${r.car?.name || 'Unknown Vehicle'}`.trim();
    if (!groupedByCar[carKey]) {
      groupedByCar[carKey] = { carLabel, reviews: [], avgRating: 0 };
    }
    groupedByCar[carKey].reviews.push(r);
  });
  // Calculate average rating per car
  Object.values(groupedByCar).forEach(group => {
    group.avgRating = (group.reviews.reduce((sum, r) => sum + r.rating, 0) / group.reviews.length).toFixed(1);
  });

  const carGroups = Object.entries(groupedByCar).sort((a, b) => b[1].reviews.length - a[1].reviews.length);

  if (loading) return <div className="container py-5 mt-5 text-center"><div className="spinner-border text-primary"></div></div>;

  return (
    <main className="container-fluid my-5 pt-5 px-md-5">
      <div className="row mt-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold text-dark mb-0">Reviews</h2>
              <p className="text-muted small">Customer reviews grouped by vehicle</p>
            </div>
            <div className="badge bg-light text-dark border fs-6">{reviews.length} Reviews · {carGroups.length} Vehicles</div>
          </div>

          {alert && <div className={`alert alert-${alert.type} alert-dismissible rounded-3 mb-4`}>{alert.msg}<button className="btn-close" onClick={() => setAlert(null)}></button></div>}

          {carGroups.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="fas fa-star fa-3x mb-3 opacity-25"></i>
              <p>No reviews yet.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-4">
              {carGroups.map(([carId, group]) => (
                <div key={carId} className="card border-0 shadow-sm rounded-4 overflow-hidden">
                  {/* Car Header — clickable to expand */}
                  <div
                    className="d-flex align-items-center justify-content-between p-4 bg-light cursor-pointer"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setExpandedCar(expandedCar === carId ? null : carId)}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-primary bg-opacity-10 rounded-3 p-3">
                        <i className="fas fa-car text-primary fa-lg"></i>
                      </div>
                      <div>
                        <h5 className="fw-bold mb-0 text-dark">{group.carLabel}</h5>
                        <div className="d-flex align-items-center gap-3 mt-1">
                          <span className="text-warning">{renderStars(Math.round(group.avgRating))}</span>
                          <span className="text-muted small fw-bold">{group.avgRating} avg</span>
                          <span className="badge bg-primary rounded-pill">{group.reviews.length} review{group.reviews.length > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                    <i className={`fas fa-chevron-${expandedCar === carId ? 'up' : 'down'} text-muted`}></i>
                  </div>

                  {/* Reviews Table — shown when expanded */}
                  {expandedCar === carId && (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="bg-white">
                          <tr>
                            <th className="border-0 text-muted small fw-bold text-uppercase ps-4 py-3">Customer</th>
                            <th className="border-0 text-muted small fw-bold text-uppercase py-3">Rating</th>
                            <th className="border-0 text-muted small fw-bold text-uppercase py-3" style={{ maxWidth: '300px' }}>Comment</th>
                            <th className="border-0 text-muted small fw-bold text-uppercase py-3">Admin Reply</th>
                            <th className="border-0 text-muted small fw-bold text-uppercase py-3">Date</th>
                            <th className="border-0 text-muted small fw-bold text-uppercase py-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.reviews.map(r => (
                            <tr key={r.review_id}>
                              <td className="ps-4">
                                <div className="d-flex align-items-center gap-2">
                                  <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center fw-bold text-primary" style={{ width: '36px', height: '36px', minWidth: '36px', fontSize: '0.85rem' }}>
                                    {r.user?.name?.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="fw-bold small">{r.user?.name}</span>
                                </div>
                              </td>
                              <td>
                                <span className="text-warning">{renderStars(r.rating)}</span>
                                <span className="ms-1 text-muted small">({r.rating})</span>
                              </td>
                              <td style={{ maxWidth: '300px' }}>
                                <p className="text-muted small mb-0 text-truncate" title={r.comment}>{r.comment || '—'}</p>
                              </td>
                              <td style={{ maxWidth: '250px' }}>
                                {replyingId === r.review_id ? (
                                  <div>
                                    <textarea
                                      className="form-control form-control-sm bg-light border-0 rounded-3 mb-2"
                                      rows="2"
                                      placeholder="Write your reply..."
                                      value={replyText}
                                      onChange={e => setReplyText(e.target.value)}
                                      autoFocus
                                    ></textarea>
                                    <div className="d-flex gap-1">
                                      <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={() => submitReply(r.review_id)}>Post</button>
                                      <button className="btn btn-light btn-sm rounded-pill px-2" onClick={() => { setReplyingId(null); setReplyText(''); }}>Cancel</button>
                                    </div>
                                  </div>
                                ) : r.admin_reply ? (
                                  <div className="p-2 bg-primary bg-opacity-10 rounded-3 border border-primary-subtle">
                                    <div className="small fw-bold text-primary mb-1"><i className="fas fa-reply me-1"></i>Rentify Team</div>
                                    <p className="small mb-0 text-dark text-truncate" title={r.admin_reply}>{r.admin_reply}</p>
                                  </div>
                                ) : (
                                  <span className="text-muted small">—</span>
                                )}
                              </td>
                              <td className="text-muted small">{new Date(r.created_at).toLocaleDateString('en-IN')}</td>
                              <td className="text-center">
                                <div className="d-flex gap-1 justify-content-center">
                                  <button
                                    className={`btn btn-sm rounded-circle border shadow-sm ${r.is_liked ? 'btn-danger' : 'btn-light'}`}
                                    onClick={() => toggleLike(r.review_id)}
                                    title={r.is_liked ? 'Unlike' : 'Like'}
                                    style={{ width: '32px', height: '32px' }}
                                  >
                                    <i className={`fas fa-heart ${r.is_liked ? 'text-white' : 'text-danger'}`} style={{ fontSize: '0.75rem' }}></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-light rounded-circle border shadow-sm"
                                    onClick={() => { setReplyingId(r.review_id); setReplyText(r.admin_reply || ''); }}
                                    title={r.admin_reply ? 'Edit Reply' : 'Reply'}
                                    style={{ width: '32px', height: '32px' }}
                                  >
                                    <i className="fas fa-reply text-primary" style={{ fontSize: '0.75rem' }}></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-light rounded-circle border shadow-sm"
                                    onClick={() => deleteReview(r.review_id)}
                                    title="Delete"
                                    style={{ width: '32px', height: '32px' }}
                                  >
                                    <i className="fas fa-trash text-danger" style={{ fontSize: '0.75rem' }}></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default AdminReviewsPage;
