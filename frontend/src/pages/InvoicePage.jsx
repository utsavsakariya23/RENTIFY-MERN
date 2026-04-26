 import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';

const InvoicePage = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const { data } = await API.get(`/bookings/${id}`);
        setBooking(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchBooking();
  }, [id]);

  if (loading) return <div className="text-center py-5 mt-5"><div className="spinner-border text-primary"></div></div>;

  if (!booking) return (
    <div className="container text-center py-5 mt-5">
      <h4 className="text-danger">Invoice Not Found</h4>
      <p className="text-muted">This booking does not exist or you don't have access.</p>
      <Link to="/my-bookings" className="btn btn-primary rounded-pill px-4">← My Bookings</Link>
    </div>
  );

  const gstRate = 0.18;
  const baseAmount = booking.final_price / (1 + gstRate);
  const gstAmount = booking.final_price - baseAmount;

  return (
    <>
      {/* Print Bar */}
      <div className="d-print-none text-center py-3 sticky-top" style={{ background: '#0d6efd', zIndex: 999 }}>
        <button onClick={() => window.print()} className="btn btn-light me-2 rounded-pill px-4">
          <i className="fas fa-print me-2"></i>Print Invoice
        </button>
        <Link to="/my-bookings" className="btn btn-outline-light rounded-pill px-4">← Back</Link>
      </div>

      {/* Invoice */}
      <div style={{ maxWidth: '800px', margin: '2rem auto', background: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', overflow: 'hidden', fontFamily: "'Segoe UI', sans-serif" }}>
        {/* Invoice Header */}
        <div style={{ background: 'linear-gradient(135deg, #0d6efd, #0a58ca)', color: 'white', padding: '2.5rem' }}>
          <div className="row align-items-center">
            <div className="col">
              <div style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-1px' }}>🚗 RENTIFY</div>
              <div style={{ fontSize: '0.85rem', opacity: '0.85' }}>Car Rental Services | GST No: 24XXXXX0001Z1</div>
              <div style={{ fontSize: '0.85rem', opacity: '0.85' }}>Main Street, Rajkot, Gujarat — 360001</div>
              <div style={{ fontSize: '0.85rem', opacity: '0.85' }}>Email: rentify@gmail.com | Ph: +91 98765 43210</div>
            </div>
            <div className="col-auto text-end">
              <div style={{ fontSize: '0.9rem', opacity: '0.8' }}>TAX INVOICE</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800' }}>#{booking.booking_id}</div>
              <div style={{ fontSize: '0.85rem', opacity: '0.8' }}>Date: {new Date(booking.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '2rem' }}>
          {/* Bill To & Reference */}
          <div className="row mb-4">
            <div className="col-md-6">
              <h6 className="fw-bold text-muted text-uppercase small">Bill To</h6>
              <div className="fw-bold fs-5">{booking.User?.name}</div>
              <div className="text-muted">{booking.User?.email}</div>
            </div>
            <div className="col-md-6 text-md-end">
              <h6 className="fw-bold text-muted text-uppercase small">Booking Reference</h6>
              <div className="fw-bold">RENT-{booking.booking_id}</div>
              <div className="text-muted small">Status: <strong>{booking.booking_status}</strong></div>
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="p-3 rounded-3 mb-4 border" style={{ background: '#f8f9fa' }}>
            <h6 className="fw-bold text-muted text-uppercase small mb-3 border-bottom pb-2">Vehicle Specifications</h6>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="small text-muted text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Vehicle</div>
                <div className="fw-bold">{booking.car?.brand} {booking.car?.name} ({booking.car?.model_year})</div>
                <div className="small text-muted">{booking.car?.car_type} &bull; {booking.car?.seats} Seater</div>
              </div>
              <div className="col-md-3">
                <div className="small text-muted text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Pickup</div>
                <div className="small"><i className="fas fa-map-marker-alt text-success me-1"></i>{booking.pickup_location || '—'}</div>
                {booking.is_permanent_location && <span className="badge bg-success-subtle text-success border-success-subtle mt-1" style={{ fontSize: '0.6rem' }}>HOME LOCATION</span>}
              </div>
              <div className="col-md-3 text-md-end">
                <div className="small text-muted text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Return</div>
                <div className="small"><i className="fas fa-map-marker-alt text-danger me-1"></i>{booking.drop_location || '—'}</div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          {[
            {
              label: `Rental — ${booking.total_days} day(s) × Rs. ${Math.round(booking.total_price / booking.total_days)}/day`,
              value: `Rs. ${booking.total_price}`,
              style: {}
            },
            {
              label: `📅 Pickup: ${booking.start_date}  →  Drop: ${booking.end_date}`,
              value: '—',
              style: { color: '#6c757d', fontSize: '0.85rem' }
            },
            {
              label: '🚚 Delivery & Pick-up Charge',
              value: booking.delivery_fee > 0 ? `Rs. ${booking.delivery_fee}` : 'Free',
              style: { color: booking.delivery_fee > 0 ? '#000' : '#198754' }
            },
            ...(booking.discount_amount > 0 ? [{
              label: '🏷️ Coupon Discount',
              value: `- Rs. ${booking.discount_amount}`,
              style: { color: '#198754' }
            }] : []),
            { label: 'Sub-Total (Excl. GST)', value: `Rs. ${baseAmount.toFixed(2)}`, style: { color: '#6c757d', borderTop: '1px solid #dee2e6', marginTop: '10px', paddingTop: '10px' } },
            { label: 'GST @ 18% (CGST 9% + SGST 9%)', value: `Rs. ${gstAmount.toFixed(2)}`, style: { color: '#dc3545' } },
          ].map((item, i) => (
            <div key={i} className="d-flex justify-content-between py-2" style={{ ...item.style }}>
              <div>{item.label}</div>
              <div className="fw-bold">{item.value}</div>
            </div>
          ))}

          {/* Total */}
          <div className="d-flex justify-content-between py-3 fw-bold fs-5" style={{ borderTop: '2px solid #0d6efd', marginTop: '0.5rem' }}>
            <div>TOTAL AMOUNT</div>
            <div className="text-primary">Rs. {booking.final_price}</div>
          </div>

          {/* Payment Info */}
          <div className="row mt-4">
            <div className="col-md-8">
              <h6 className="fw-bold text-muted text-uppercase small">Payment Information</h6>
              <div className="small">Method: <strong>{booking.payment_method || 'Cash'}</strong></div>
              {booking.transaction_id && <div className="small">Transaction ID: <code>{booking.transaction_id}</code></div>}
              <div className="mt-2" style={{ fontSize: '0.8rem', color: '#6c757d' }}>* GST is inclusive in the total amount. This is a computer-generated invoice.</div>
            </div>
            <div className="col-md-4 text-end">
              {booking.payment_status === 'Paid' ? (
                <div style={{ display: 'inline-block', border: '3px solid #198754', color: '#198754', fontWeight: 900, fontSize: '1.4rem', padding: '0.25rem 1rem', borderRadius: '8px', transform: 'rotate(-5deg)', letterSpacing: '2px' }}>PAID ✓</div>
              ) : (
                <div style={{ display: 'inline-block', border: '3px solid #dc3545', color: '#dc3545', fontWeight: 900, fontSize: '1.4rem', padding: '0.25rem 1rem', borderRadius: '8px', transform: 'rotate(-5deg)', letterSpacing: '2px' }}>UNPAID</div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-4 pt-3 border-top">
            <p className="text-muted small mb-0">Thank you for choosing Rentify! For support, email rentify@gmail.com or call +91 98765 43210.</p>
            <p className="text-muted small">This invoice is subject to our <a href="#" className="text-muted">Terms & Conditions</a>.</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white; }
          .d-print-none { display: none !important; }
        }
      `}</style>
    </>
  );
};

export default InvoicePage;
