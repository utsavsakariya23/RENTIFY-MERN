import React, { useState } from 'react';
import API from '../services/api';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus('empty');
      return;
    }
    setLoading(true);
    try {
      await API.post('/contact', formData);
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      setStatus('error');
    }
    setLoading(false);
  };

  return (
    <main className="py-5" style={{ marginTop: '76px' }}>
      {/* Header */}
      <section className="container text-center mb-5">
        <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-bold mb-3">Get In Touch</span>
        <h1 className="display-5 fw-bold">We'd Love to Hear From You</h1>
        <p className="lead text-muted mx-auto" style={{ maxWidth: '600px' }}>
          Have questions about our fleet, pricing, or your booking? Our team is ready to assist you.
        </p>
      </section>

      {/* Content */}
      <section className="container mb-5">
        <div className="row g-4">
          {/* Contact Info Panel */}
          <div className="col-lg-5">
            <div className="card border-0 h-100 p-4 rounded-4 text-white" style={{ background: 'linear-gradient(135deg, #0d6efd, #0a58ca)' }}>
              <h3 className="fw-bold mb-3">Contact Information</h3>
              <p className="mb-4 opacity-75">Fill up the form and our team will get back to you within 24 hours.</p>

              {[
                { icon: 'fas fa-phone-alt', label: 'Phone', value: '+91 11 234 5678' },
                { icon: 'fas fa-envelope', label: 'Email', value: 'rentify@gmail.com' },
                { icon: 'fas fa-map-marker-alt', label: 'Address', value: 'Main Street, Rajkot, Gujarat' },
              ].map((item) => (
                <div className="d-flex mb-4 align-items-center" key={item.label}>
                  <div className="bg-white bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ width: '50px', height: '50px' }}>
                    <i className={item.icon}></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0">{item.label}</h6>
                    <p className="mb-0 opacity-75">{item.value}</p>
                  </div>
                </div>
              ))}

              <div className="mt-auto">
                <h6 className="fw-bold mb-3">Follow Us</h6>
                <div className="d-flex gap-3">
                  {['fab fa-facebook-f', 'fab fa-twitter', 'fab fa-instagram', 'fab fa-linkedin-in'].map((icon) => (
                    <a href="#" className="text-white bg-white bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center" key={icon} style={{ width: '36px', height: '36px' }}>
                      <i className={icon}></i>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="col-lg-7">
            <div className="card border-0 p-4 h-100 rounded-4 shadow-sm">
              <h3 className="fw-bold mb-4">Send Message</h3>

              {status === 'success' && (
                <div className="alert alert-success alert-dismissible d-flex align-items-center" role="alert">
                  <i className="fas fa-check-circle me-2"></i>
                  <strong>Message sent!</strong>&nbsp;We'll get back to you within 24 hours.
                  <button type="button" className="btn-close ms-auto" onClick={() => setStatus(null)}></button>
                </div>
              )}
              {status === 'error' && (
                <div className="alert alert-danger alert-dismissible d-flex align-items-center" role="alert">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  Failed to send message. Please try again.
                  <button type="button" className="btn-close ms-auto" onClick={() => setStatus(null)}></button>
                </div>
              )}
              {status === 'empty' && (
                <div className="alert alert-warning alert-dismissible d-flex align-items-center" role="alert">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Please fill in all required fields.
                  <button type="button" className="btn-close ms-auto" onClick={() => setStatus(null)}></button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">FULL NAME <span className="text-danger">*</span></label>
                    <input type="text" name="name" className="form-control bg-light border-0 py-2" placeholder="Enter your full name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">EMAIL <span className="text-danger">*</span></label>
                    <input type="email" name="email" className="form-control bg-light border-0 py-2" placeholder="Enter your email" value={formData.email} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">PHONE</label>
                    <input type="tel" name="phone" className="form-control bg-light border-0 py-2" placeholder="Enter your phone number" value={formData.phone} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">SUBJECT</label>
                    <input type="text" name="subject" className="form-control bg-light border-0 py-2" placeholder="Enter subject" value={formData.subject} onChange={handleChange} />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-bold text-muted">MESSAGE <span className="text-danger">*</span></label>
                    <textarea name="message" className="form-control bg-light border-0 py-2" rows="5" placeholder="Your message here..." value={formData.message} onChange={handleChange} required></textarea>
                  </div>
                  <div className="col-12 text-end">
                    <button type="submit" className="btn btn-primary px-5 btn-lg rounded-pill fw-bold shadow-sm" disabled={loading}>
                      {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Sending...</> : <><i className="fas fa-paper-plane me-2"></i>Send Message</>}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="container-fluid p-0">
        <div className="d-flex align-items-center justify-content-center text-center text-muted flex-column" style={{ width: '100%', height: '350px', background: '#f0f4f8' }}>
          <i className="fas fa-map-marked-alt fa-3x mb-3 text-primary opacity-50"></i>
          <p className="fw-bold mb-0">Rajkot, Gujarat, India</p>
          <small>Rentify HQ — Main Street</small>
        </div>
      </section>
    </main>
  );
};

export default ContactPage;
