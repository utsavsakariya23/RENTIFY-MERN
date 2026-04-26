import React, { useState, useEffect } from 'react';
import API from '../services/api';

const AdminMessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMsg, setViewMsg] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [replySuccess, setReplySuccess] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await API.get('/contact');
        setMessages(data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchMessages();
  }, []);

  const markRead = async (id) => {
    try {
      await API.put(`/contact/${id}/read`);
      setMessages(messages.map(m => m.message_id === id ? { ...m, is_read: true } : m));
    } catch (err) { console.error(err); }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      await API.post(`/contact/${viewMsg.message_id}/reply`, { message: replyText });
      setReplySuccess('Reply sent successfully!');
      setTimeout(() => {
        setReplySuccess('');
        setIsReplying(false);
        setReplyText('');
      }, 2500);
    } catch (err) {
      console.error(err);
      alert('Failed to send reply');
    }
  };

  if (loading) return <div className="container py-5 mt-5 text-center"><div className="spinner-border text-primary"></div></div>;

  return (
    <main className="container-fluid my-5 pt-5 px-md-5">
      <div className="row mt-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold text-dark mb-0">Contact Messages</h2>
              <p className="text-muted small">Messages from the contact form</p>
            </div>
            <span className="badge bg-primary rounded-pill px-3 py-2">
              {messages.filter(m => !m.is_read).length} unread
            </span>
          </div>

          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    {['Name', 'Email', 'Phone', 'Subject', 'Date', 'Status', 'Actions'].map(h => (
                      <th key={h} className="border-0 text-muted small fw-bold text-uppercase py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {messages.map((m, i) => (
                    <tr key={i} className={!m.is_read ? 'table-light fw-bold' : ''}>
                      <td className="ps-3">
                        <div className="d-flex align-items-center">
                          {!m.is_read && <div className="bg-primary rounded-circle me-2" style={{ width: '8px', height: '8px' }}></div>}
                          {m.name}
                        </div>
                      </td>
                      <td className="text-muted small">{m.email}</td>
                      <td className="text-muted small">{m.phone || '—'}</td>
                      <td>{m.subject || '—'}</td>
                      <td className="text-muted small">{new Date(m.created_at || m.createdAt).toLocaleDateString('en-IN')}</td>
                      <td>
                        <span className={`badge rounded-pill px-3 ${m.is_read ? 'bg-secondary' : 'bg-primary'}`}>
                          {m.is_read ? 'Read' : 'Unread'}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-light btn-sm rounded-pill border me-2" onClick={() => { setViewMsg(m); if (!m.is_read) markRead(m.message_id); }}>
                          <i className="fas fa-eye text-primary me-1"></i>View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {messages.length === 0 && (
                    <tr><td colSpan="7" className="text-center py-5 text-muted">No contact messages received yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {viewMsg && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header border-0 p-4">
                <h5 className="modal-title fw-bold">Message from {viewMsg.name}</h5>
                <button type="button" className="btn-close" onClick={() => { setViewMsg(null); setIsReplying(false); }}></button>
              </div>
              <div className="modal-body p-4 pt-0">
                <div className="d-flex gap-4 mb-3">
                  <div><span className="text-muted small">Email:</span><div>{viewMsg.email}</div></div>
                  <div><span className="text-muted small">Phone:</span><div>{viewMsg.phone || '—'}</div></div>
                  <div><span className="text-muted small">Subject:</span><div>{viewMsg.subject || '—'}</div></div>
                </div>
                <div className="bg-light rounded-4 p-4 mb-3">
                  <p className="mb-0">{viewMsg.message}</p>
                </div>

                {isReplying && (
                  <div className="animate__animated animate__fadeIn">
                    <label className="form-label fw-bold small text-primary">YOUR REPLY</label>
                    <textarea 
                      className="form-control bg-light border-0 mb-3" 
                      rows="4" 
                      placeholder="Type your response here. It will be emailed directly to the user."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    ></textarea>
                    {replySuccess && <div className="text-success small fw-bold mb-2"><i className="fas fa-check-circle me-1"></i>{replySuccess}</div>}
                  </div>
                )}
              </div>
              <div className="modal-footer border-0 p-4 pt-0 justify-content-between">
                <button className="btn btn-light rounded-pill px-4" onClick={() => { setViewMsg(null); setIsReplying(false); }}>Close</button>
                {isReplying ? (
                  <button className="btn btn-primary rounded-pill px-4 fw-bold" onClick={handleReply} disabled={!replyText.trim() || replySuccess}>
                    <i className="fas fa-paper-plane me-2"></i>Send Reply
                  </button>
                ) : (
                  <button className="btn btn-primary rounded-pill px-4 fw-bold" onClick={() => setIsReplying(true)}>
                    <i className="fas fa-reply me-2"></i>Reply via System
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminMessagesPage;
