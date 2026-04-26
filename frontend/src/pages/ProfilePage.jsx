import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { userInfo, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [bookings, setBookings] = useState([]);
  const [bookingFilter, setBookingFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [reviewModal, setReviewModal] = useState(null); // { bookingId, carName }
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [profileData, setProfileData] = useState({
    name: userInfo?.name || '',
    email: userInfo?.email || '',
    phone_number: userInfo?.phone_number || '',
    address: userInfo?.address || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [documents, setDocuments] = useState(null);
  const [uploading, setUploading] = useState({ gov_id: false, license: false });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get('/auth/profile');
        setProfileData({
          name: data.name || '',
          email: data.email || '',
          phone_number: data.phone_number || '',
          address: data.address || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookings();
    }
    if (activeTab === 'documents') {
      fetchDocuments();
    }
  }, [activeTab]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/bookings/my');
      setBookings(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await API.post('/bookings/review', { bookingId: reviewModal.bookingId, ...reviewData });
      setAlert({ type: 'success', msg: 'Review submitted successfully!' });
      setReviewModal(null);
      fetchBookings();
    } catch (err) {
      setAlert({ type: 'danger', msg: 'Failed to submit review.' });
    }
  };

  const statusBadge = (s) => {
    const map = { Pending: 'warning text-dark', Confirmed: 'primary', Completed: 'success', Cancelled: 'danger' };
    return <span className={`badge bg-${map[s] || 'secondary'} rounded-pill px-3`}>{s}</span>;
  };

  const paymentBadge = (s) => {
    const map = { Paid: 'success', Refunded: 'info', Unpaid: 'secondary' };
    return <span className={`badge bg-${map[s] || 'secondary'} rounded-pill px-3`}>{s}</span>;
  };

  const fetchDocuments = async () => {
    try {
      const { data } = await API.get('/documents/my');
      setDocuments(data);
    } catch (err) {
      console.error('Failed to fetch documents', err);
    }
  };

  const handleDocumentUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading({ ...uploading, [type]: true });
    setMessage({ type: '', text: '' });
    
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'rentifymern');
    data.append('folder', 'rentify_document');

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: data }
      );
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || 'Cloudinary upload failed');
      }

      const fileData = await res.json();
      
      if (fileData.secure_url) {
        const response = await API.post('/documents/upload', { type, url: fileData.secure_url });
        if (response.data) {
          fetchDocuments();
          setMessage({ type: 'success', text: `${type.replace('_', ' ').toUpperCase()} uploaded successfully!` });
        }
      } else {
        throw new Error('No secure URL returned from Cloudinary');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setMessage({ 
        type: 'danger', 
        text: `Upload failed: ${err.response?.data?.message || err.message}` 
      });
    }
    setUploading({ ...uploading, [type]: false });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Validation for password change
    if (profileData.newPassword || profileData.currentPassword || profileData.confirmPassword) {
      if (!profileData.currentPassword) {
        setMessage({ type: 'danger', text: 'Current password is required to change password' });
        return;
      }
      if (profileData.newPassword !== profileData.confirmPassword) {
        setMessage({ type: 'danger', text: 'New passwords do not match' });
        return;
      }
      if (profileData.newPassword.length < 6) {
        setMessage({ type: 'danger', text: 'New password must be at least 6 characters' });
        return;
      }
    }

    try {
      await API.put('/auth/profile', {
        name: profileData.name,
        phone_number: profileData.phone_number,
        address: profileData.address,
        currentPassword: profileData.currentPassword || undefined,
        newPassword: profileData.newPassword || undefined
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      // Clear password fields
      setProfileData({
        ...profileData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setMessage({ 
        type: 'danger', 
        text: err.response?.data?.message || 'Failed to update profile' 
      });
    }
  };

  const cancelBooking = async (id) => {
    const booking = bookings.find(b => b.booking_id === id);
    const isPaidOnline = booking?.payment_status === 'Paid' && booking?.payment_method === 'Online';
    const confirmMsg = isPaidOnline
      ? 'This booking was paid online. Cancelling will request a refund from admin. Continue?'
      : 'Are you sure you want to cancel this booking?';
    if (!window.confirm(confirmMsg)) return;
    try {
      const { data } = await API.put(`/bookings/${id}/cancel`);
      fetchBookings();
      if (data.needsRefund) {
        setAlert({ type: 'info', msg: 'Booking cancelled. A refund request has been sent to admin. You will receive a confirmation email once processed.' });
      } else {
        setAlert({ type: 'success', msg: 'Booking cancelled successfully.' });
      }
    } catch (err) {
      setAlert({ type: 'danger', msg: err.response?.data?.message || 'Failed to cancel booking' });
    }
  };

  return (
    <main className="container my-5 pt-5">
      <div className="row mt-4">
        {/* Sidebar Nav */}
        <div className="col-md-3 mb-4">
          <div className="bg-white p-4 rounded-4 shadow-sm border border-light sticky-top" style={{ top: '100px' }}>
            <div className="text-center mb-4">
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm"
                style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                {userInfo?.name?.charAt(0).toUpperCase()}
              </div>
              <h5 className="fw-bold mb-1 text-dark text-truncate">{userInfo?.name}</h5>
              <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-1 small">
                {userInfo?.role || 'Customer'}
              </span>
            </div>

            <div className="list-group list-group-flush rounded-3 overflow-hidden">
              <button 
                onClick={() => setActiveTab('profile')} 
                className={`list-group-item list-group-item-action border-0 px-3 py-3 ${activeTab === 'profile' ? 'active bg-primary' : 'bg-transparent text-muted fw-medium'}`}
              >
                <i className="fas fa-user-circle me-3"></i> My Profile
              </button>
              <button 
                onClick={() => setActiveTab('bookings')} 
                className={`list-group-item list-group-item-action border-0 px-3 py-3 ${activeTab === 'bookings' ? 'active bg-primary' : 'bg-transparent text-muted fw-medium'}`}
              >
                <i className="fas fa-calendar-alt me-3"></i> My Bookings
              </button>
              <button 
                onClick={() => setActiveTab('payments')} 
                className={`list-group-item list-group-item-action border-0 px-3 py-3 ${activeTab === 'payments' ? 'active bg-primary' : 'bg-transparent text-muted fw-medium'}`}
              >
                <i className="fas fa-credit-card me-3"></i> Payments
              </button>
              <button 
                onClick={() => setActiveTab('documents')} 
                className={`list-group-item list-group-item-action border-0 px-3 py-3 ${activeTab === 'documents' ? 'active bg-primary' : 'bg-transparent text-muted fw-medium'}`}
              >
                <i className="fas fa-file-alt me-3"></i> Documents
                {documents && (documents.gov_id_status === 'Pending' || documents.license_status === 'Pending') && (
                  <span className="badge bg-warning text-dark rounded-pill float-end smaller">Pending</span>
                )}
                {documents && (documents.gov_id_status === 'Verified' && documents.license_status === 'Verified') && (
                  <span className="badge bg-success rounded-pill float-end smaller">Verified</span>
                )}
              </button>
              <button 
                onClick={logout} 
                className="list-group-item list-group-item-action border-0 px-3 py-3 bg-transparent text-danger fw-medium"
              >
                <i className="fas fa-sign-out-alt me-3"></i> Logout
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="col-md-9">
          <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm border border-light h-100 min-vh-50">
            
            {activeTab === 'profile' && (
              <div className="animate__animated animate__fadeIn">
                <h4 className="fw-bold mb-4 text-dark">Profile Settings</h4>
                {message.text && <div className={`alert alert-${message.type} rounded-3`}>{message.text}</div>}
                
                <form onSubmit={handleProfileUpdate}>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted text-uppercase tracking-wider">Full Name</label>
                      <input 
                        type="text" 
                        className="form-control bg-light border-0 p-3 rounded-3" 
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted text-uppercase tracking-wider">Email (Read Only)</label>
                      <input type="email" className="form-control bg-light border-0 p-3 rounded-3" value={profileData.email} readOnly />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted text-uppercase tracking-wider">Phone Number</label>
                      <input 
                        type="text" 
                        className="form-control bg-light border-0 p-3 rounded-3" 
                        value={profileData.phone_number}
                        onChange={(e) => setProfileData({...profileData, phone_number: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted text-uppercase tracking-wider">Home Address</label>
                      <input 
                        type="text" 
                        className="form-control bg-light border-0 p-3 rounded-3" 
                        value={profileData.address}
                        onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                        placeholder="Enter your full home address"
                      />
                    </div>
                  </div>
                  <div className="row g-4 mt-2">
                    <div className="col-12">
                      <hr className="my-4 opacity-25" />
                      <h5 className="fw-bold mb-3 text-dark">Change Password</h5>
                      <p className="text-muted small mb-4">Leave blank if you don't want to change your password.</p>
                    </div>
                    <div className="col-md-12">
                      <label className="form-label small fw-bold text-muted text-uppercase tracking-wider">Current Password</label>
                      <input 
                        type="password" 
                        className="form-control bg-light border-0 p-3 rounded-3" 
                        value={profileData.currentPassword}
                        onChange={(e) => setProfileData({...profileData, currentPassword: e.target.value})}
                        placeholder="Enter current password"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted text-uppercase tracking-wider">New Password</label>
                      <input 
                        type="password" 
                        className="form-control bg-light border-0 p-3 rounded-3" 
                        value={profileData.newPassword}
                        onChange={(e) => setProfileData({...profileData, newPassword: e.target.value})}
                        placeholder="Minimum 6 characters"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted text-uppercase tracking-wider">Confirm New Password</label>
                      <input 
                        type="password" 
                        className="form-control bg-light border-0 p-3 rounded-3" 
                        value={profileData.confirmPassword}
                        onChange={(e) => setProfileData({...profileData, confirmPassword: e.target.value})}
                        placeholder="Re-enter new password"
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary px-5 py-3 rounded-pill fw-bold shadow-sm mt-5">
                    <i className="fas fa-save me-2"></i>SAVE CHANGES
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="animate__animated animate__fadeIn">
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3 border-bottom pb-4">
                  <div>
                    <h4 className="fw-bold text-dark mb-1">My Rental History</h4>
                    <p className="text-muted small mb-0">Manage your past and upcoming car bookings</p>
                  </div>
                  <div className="d-flex gap-2 align-items-center">
                    <div className="btn-group btn-group-sm rounded-pill overflow-hidden border">
                      {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(s => (
                        <button 
                          key={s} 
                          className={`btn border-0 px-3 ${bookingFilter === s ? 'btn-primary' : 'btn-light text-muted'}`}
                          onClick={() => setBookingFilter(s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <button onClick={fetchBookings} className="btn btn-sm btn-white border rounded-circle" style={{width:'32px', height:'32px'}} title="Refresh">
                      <i className="fas fa-sync-alt"></i>
                    </button>
                  </div>
                </div>

                {alert && (
                  <div className={`alert alert-${alert.type} alert-dismissible fade show rounded-3 mb-4`} role="alert">
                    <i className={`fas fa-${alert.type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2`}></i>
                    {alert.msg}
                    <button type="button" className="btn-close shadow-none" onClick={() => setAlert(null)}></button>
                  </div>
                )}

                {loading ? (
                  <div className="text-center py-5"><div className="spinner-border text-primary spinner-border-sm"></div></div>
                ) : (
                  <div className="table-responsive rounded-4">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="bg-light">
                        <tr style={{ background: '#f8f9fa' }}>
                          <th className="border-0 text-muted small fw-bold text-uppercase ps-3 py-3">Car</th>
                          <th className="border-0 text-muted small fw-bold text-uppercase py-3">Dates & Days</th>
                          <th className="border-0 text-muted small fw-bold text-uppercase py-3">Price</th>
                          <th className="border-0 text-muted small fw-bold text-uppercase py-3">Status</th>
                          <th className="border-0 text-muted small fw-bold text-uppercase py-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.filter(b => bookingFilter === 'All' || b.booking_status === bookingFilter).length > 0 ? (
                          bookings
                            .filter(b => bookingFilter === 'All' || b.booking_status === bookingFilter)
                            .map((booking) => (
                              <tr key={booking.booking_id}>
                                <td className="ps-3 py-3">
                                  <div className="d-flex align-items-center">
                                    <div className="bg-light rounded-3 p-2 me-3 d-none d-md-block border" style={{ width: '50px', height: '40px' }}>
                                      {booking.car?.image_url ? (
                                        <img src={booking.car.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} className="rounded-1" />
                                      ) : (
                                        <i className="fas fa-car text-primary small"></i>
                                      )}
                                    </div>
                                    <div>
                                      <div className="fw-bold text-dark">{booking.car?.name}</div>
                                      <div className="text-muted smaller">{booking.car?.brand}</div>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div className="small fw-medium">{new Date(booking.start_date).toLocaleDateString()} &rarr; {new Date(booking.end_date).toLocaleDateString()}</div>
                                  <div className="badge bg-light text-muted border smaller font-monospace">{booking.total_days} nights</div>
                                </td>
                                <td>
                                  <div className="fw-bold text-primary">Rs. {booking.final_price}</div>
                                  {booking.discount_amount > 0 && <div className="text-muted smaller text-decoration-line-through">Rs. {booking.total_price}</div>}
                                </td>
                                <td>
                                  <div className="mb-1">{statusBadge(booking.booking_status)}</div>
                                  <div>{paymentBadge(booking.payment_status)}</div>
                                </td>
                                <td className="text-center">
                                  <div className="dropdown">
                                    <button className="btn btn-sm btn-light border rounded-circle shadow-none" data-bs-toggle="dropdown" style={{width:'32px', height:'32px'}}>
                                      <i className="fas fa-ellipsis-v small"></i>
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3 p-2">
                                      {['Pending', 'Confirmed'].includes(booking.booking_status) && (
                                        <li>
                                          <button className="dropdown-item text-danger rounded-2 py-2" onClick={() => cancelBooking(booking.booking_id)}>
                                            <i className="fas fa-times-circle me-2"></i>Cancel Booking
                                          </button>
                                        </li>
                                      )}
                                      {booking.booking_status === 'Completed' && booking.payment_status === 'Paid' && (
                                        <li>
                                          <button className="dropdown-item text-warning rounded-2 py-2 fw-medium" onClick={() => { setReviewModal({ bookingId: booking.booking_id, carName: booking.car?.name }); setReviewData({ rating: 5, comment: '' }); }}>
                                            <i className="fas fa-star me-2"></i>Write Review
                                          </button>
                                        </li>
                                      )}
                                      {booking.payment_status === 'Paid' && (
                                        <li>
                                          <Link to={`/invoice/${booking.booking_id}`} target="_blank" className="dropdown-item text-primary rounded-2 py-2 fw-medium">
                                            <i className="fas fa-file-invoice me-2"></i>View Invoice
                                          </Link>
                                        </li>
                                      )}
                                      <li>
                                        <hr className="dropdown-divider opacity-10" />
                                      </li>
                                      <li>
                                        <div className="dropdown-item disabled smaller text-muted">Booking #{booking.booking_id}</div>
                                      </li>
                                    </ul>
                                  </div>
                                </td>
                              </tr>
                            ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="text-center py-5">
                              <i className="fas fa-calendar-times fa-3x text-muted opacity-25 mb-3 d-block"></i>
                              <p className="text-muted mb-0">No records found for your filter.</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="animate__animated animate__fadeIn">
                <h4 className="fw-bold mb-2 text-dark">Document Verification</h4>
                <p className="text-muted small mb-5">Please upload your documents to be able to rent vehicles without restrictions.</p>

                {message.text && <div className={`alert alert-${message.type} rounded-3 mb-4`}>{message.text}</div>}

                <div className="row g-4">
                  {/* Government ID */}
                  <div className="col-md-6">
                    <div className="p-4 rounded-4 bg-light border border-white h-100 text-center shadow-sm position-relative">
                      <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{width:'60px', height:'60px'}}>
                        <i className="fas fa-id-card fs-4"></i>
                      </div>
                      <h6 className="fw-bold mb-1">Government ID</h6>
                      <p className="text-muted smaller mb-3">Aadhar, PAN or Passport</p>
                      
                      {documents?.gov_id_url ? (
                        <div className="mb-3">
                          <img src={documents.gov_id_url} alt="Gov ID" className="img-thumbnail mb-2" style={{maxHeight:'100px'}} />
                          <div className={`badge rounded-pill d-block ${
                            documents.gov_id_status === 'Verified' ? 'bg-success' : 
                            documents.gov_id_status === 'Pending' ? 'bg-warning text-dark' : 'bg-danger'
                          }`}>
                            {documents.gov_id_status}
                          </div>
                        </div>
                      ) : null}

                      {(!documents?.gov_id_url || documents?.gov_id_status === 'Rejected') && (
                        <div className="position-relative">
                          <button className="btn btn-sm btn-primary rounded-pill px-4" disabled={uploading.gov_id}>
                            {uploading.gov_id ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                            {documents?.gov_id_url ? 'Upload Again' : 'Upload Now'}
                          </button>
                          <input 
                            type="file" 
                            className="position-absolute top-0 start-0 opacity-0 w-100 h-100 cursor-pointer" 
                            onChange={(e) => handleDocumentUpload(e, 'gov_id')}
                            accept="image/*"
                          />
                        </div>
                      )}
                      
                      {documents?.gov_id_status === 'Pending' && (
                        <p className="text-warning small mb-0"><i className="fas fa-clock me-1"></i> Awaiting verification</p>
                      )}
                      {documents?.gov_id_status === 'Verified' && (
                        <p className="text-success small mb-0"><i className="fas fa-check-circle me-1"></i> Verified</p>
                      )}
                    </div>
                  </div>

                  {/* Driving License */}
                  <div className="col-md-6">
                    <div className="p-4 rounded-4 bg-light border border-white h-100 text-center shadow-sm position-relative">
                      <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{width:'60px', height:'60px'}}>
                        <i className="fas fa-id-badge fs-4"></i>
                      </div>
                      <h6 className="fw-bold mb-1">Driving License</h6>
                      <p className="text-muted smaller mb-3">Front & Back side photos</p>

                      {documents?.license_url ? (
                        <div className="mb-3">
                          <img src={documents.license_url} alt="License" className="img-thumbnail mb-2" style={{maxHeight:'100px'}} />
                          <div className={`badge rounded-pill d-block ${
                            documents.license_status === 'Verified' ? 'bg-success' : 
                            documents.license_status === 'Pending' ? 'bg-warning text-dark' : 'bg-danger'
                          }`}>
                            {documents.license_status}
                          </div>
                        </div>
                      ) : null}

                      {(!documents?.license_url || documents?.license_status === 'Rejected') && (
                        <div className="position-relative">
                          <button className="btn btn-sm btn-primary rounded-pill px-4" disabled={uploading.license}>
                            {uploading.license ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                            {documents?.license_url ? 'Upload Again' : 'Upload Now'}
                          </button>
                          <input 
                            type="file" 
                            className="position-absolute top-0 start-0 opacity-0 w-100 h-100 cursor-pointer" 
                            onChange={(e) => handleDocumentUpload(e, 'license')}
                            accept="image/*"
                          />
                        </div>
                      )}

                      {documents?.license_status === 'Pending' && (
                        <p className="text-warning small mb-0"><i className="fas fa-clock me-1"></i> Awaiting verification</p>
                      )}
                      {documents?.license_status === 'Verified' && (
                        <p className="text-success small mb-0"><i className="fas fa-check-circle me-1"></i> Verified</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 p-4 rounded-4 bg-warning bg-opacity-10 border border-warning-subtle d-flex align-items-center">
                  <i className="fas fa-info-circle text-warning fs-4 me-3"></i>
                  <p className="mb-0 small text-dark fw-medium">Documents are usually verified within 24 hours of upload.</p>
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="animate__animated animate__fadeIn">
                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-4">
                  <div>
                    <h4 className="fw-bold text-dark mb-1">Payment History</h4>
                    <p className="text-muted small mb-0">Track your past payments and invoices</p>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-5"><div className="spinner-border text-primary spinner-border-sm"></div></div>
                ) : (
                  <>
                    <div className="row mb-5">
                      <div className="col-md-6">
                        <div className="bg-primary bg-opacity-10 rounded-4 p-4 d-flex align-items-center shadow-sm">
                          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-4" style={{width:'60px', height:'60px'}}>
                            <i className="fas fa-wallet fs-4"></i>
                          </div>
                          <div>
                            <div className="text-muted small fw-bold text-uppercase tracking-wider mb-1">Total Spent</div>
                            <h3 className="fw-bold text-primary mb-0">Rs. {bookings.filter(b => ['Paid', 'Refunded'].includes(b.payment_status)).reduce((sum, b) => sum + Number(b.final_price), 0).toFixed(2)}</h3>
                          </div>
                        </div>
                      </div>
                    </div>

                    <h6 className="fw-bold mb-3 text-muted text-uppercase tracking-wide small">Recent Transactions</h6>
                    <div className="table-responsive rounded-4">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                          <tr style={{ background: '#f8f9fa' }}>
                            <th className="border-0 text-muted small fw-bold text-uppercase ps-3 py-3">Date</th>
                            <th className="border-0 text-muted small fw-bold text-uppercase py-3">Booking ID</th>
                            <th className="border-0 text-muted small fw-bold text-uppercase py-3">Amount</th>
                            <th className="border-0 text-muted small fw-bold text-uppercase py-3">Status</th>
                            <th className="border-0 text-muted small fw-bold text-uppercase py-3 text-center">Receipt</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookings.filter(b => ['Paid', 'Refunded'].includes(b.payment_status)).length > 0 ? (
                            bookings
                              .filter(b => ['Paid', 'Refunded'].includes(b.payment_status))
                              .map(booking => (
                                <tr key={booking.booking_id}>
                                  <td className="ps-3 text-muted">{new Date(booking.created_at).toLocaleDateString()}</td>
                                  <td><span className="badge bg-light text-dark border font-monospace">#{booking.booking_id}</span></td>
                                  <td className="fw-bold text-dark">Rs. {booking.final_price}</td>
                                  <td>{paymentBadge(booking.payment_status)}</td>
                                  <td className="text-center">
                                    <Link to={`/invoice/${booking.booking_id}`} target="_blank" className="btn btn-sm btn-light border rounded-circle shadow-sm" title="View Invoice">
                                      <i className="fas fa-file-invoice text-primary"></i>
                                    </Link>
                                  </td>
                                </tr>
                              ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="text-center py-5">
                                <i className="fas fa-receipt fa-3x text-muted opacity-25 mb-3 d-block"></i>
                                <p className="text-muted mb-0">No paid bookings found.</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="modal d-block animate__animated animate__fadeIn" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header bg-primary text-white p-4 border-0">
                <div>
                  <h5 className="modal-title fw-bold mb-0">Rate your ride</h5>
                  <p className="mb-0 small opacity-75">{reviewModal.carName}</p>
                </div>
                <button type="button" className="btn-close btn-close-white shadow-none" onClick={() => setReviewModal(null)}></button>
              </div>
              <form onSubmit={submitReview}>
                <div className="modal-body p-4 pt-5">
                  <div className="text-center mb-4">
                    <label className="form-label d-block fw-bold text-muted text-uppercase smaller mb-3 tracking-widest">Select Rating</label>
                    <div className="d-flex justify-content-center gap-2 mb-2 fs-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span 
                          key={star} 
                          style={{ cursor: 'pointer', transition: 'all 0.2s', transform: star <= reviewData.rating ? 'scale(1.1)' : 'scale(1)' }} 
                          className={star <= reviewData.rating ? 'text-warning' : 'text-light'}
                          onClick={() => setReviewData({ ...reviewData, rating: star })}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <div className="fw-bold text-primary">
                      {reviewData.rating === 1 ? 'Poor' : reviewData.rating === 2 ? 'Fair' : reviewData.rating === 3 ? 'Good' : reviewData.rating === 4 ? 'Very Good' : 'Excellent!'}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase tracking-wider">Your Experience</label>
                    <textarea 
                      className="form-control bg-light border-0 p-3 rounded-3" 
                      rows="4" 
                      placeholder="Tell us what you liked (or didn't liked) about this car..." 
                      value={reviewData.comment} 
                      onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0 p-4 pt-0">
                  <button type="button" className="btn btn-light rounded-pill px-4 fw-bold" onClick={() => setReviewModal(null)}>CANCEL</button>
                  <button type="submit" className="btn btn-primary rounded-pill px-5 fw-bold shadow-sm">SUBMIT REVIEW</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ProfilePage;
