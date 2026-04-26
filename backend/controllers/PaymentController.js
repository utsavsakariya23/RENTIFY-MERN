const Razorpay = require('razorpay');
const crypto = require('crypto');
const { Booking, User } = require('../models');
const sendEmail = require('../utils/sendEmail');
const { protect } = require('../middlewares/auth');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
const createOrder = async (req, res) => {
  const { amount, bookingId } = req.body;
  try {
    const options = {
      amount: Math.round(amount), // amount in paise (already multiplied on frontend)
      currency: 'INR',
      receipt: `booking_${bookingId}`,
      notes: { bookingId: String(bookingId) }
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Verify Razorpay payment signature & mark booking Paid
// @route   POST /api/payment/verify
const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;
  try {
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature. Payment could not be verified.' });
    }

    // Mark booking as paid
    const booking = await Booking.findByPk(bookingId, {
      include: [{ model: require('../models').User, as: 'user' }, { model: require('../models').Car, as: 'car' }]
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.payment_status = 'Paid';
    booking.transaction_id = razorpay_payment_id;
    booking.payment_method = 'Online';
    booking.booking_status = 'Confirmed';
    await booking.save();

    // Send payment success email (non-blocking)
    sendEmail({
      email: booking.user?.email,
      subject: '✅ Payment Successful — Rentify',
      html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          <div style="background:linear-gradient(135deg,#198754,#146c43);color:#fff;padding:2rem;text-align:center;">
            <div style="font-size:2rem;font-weight:800;">🚗 RENTIFY</div>
            <div style="background:rgba(255,255,255,0.2);border-radius:50px;padding:8px 24px;margin-top:12px;display:inline-block;font-weight:700;">✅ PAYMENT SUCCESSFUL</div>
          </div>
          <div style="padding:2rem;">
            <p>Hello <strong>${booking.user?.name}</strong>,</p>
            <p>Your payment of <strong style="color:#198754;">Rs. ${booking.final_price}</strong> for Booking <strong>#RNT-${booking.booking_id}</strong> has been successfully received.</p>
            <table style="width:100%;border-collapse:collapse;margin:1rem 0;">
              <tr style="background:#f0fff4;"><td style="padding:10px 16px;font-weight:700;color:#198754;">Transaction ID</td><td style="padding:10px 16px;">${razorpay_payment_id}</td></tr>
              <tr style="background:#fff;"><td style="padding:10px 16px;font-weight:600;">Vehicle</td><td style="padding:10px 16px;">${booking.car?.brand} ${booking.car?.name}</td></tr>
              <tr style="background:#f9f9f9;"><td style="padding:10px 16px;font-weight:600;">Amount Paid</td><td style="padding:10px 16px;font-weight:700;color:#198754;">Rs. ${booking.final_price}</td></tr>
            </table>
            <p style="color:#555;font-size:0.9rem;">Login to your Rentify account to view your invoice. Thank you for choosing Rentify!</p>
          </div>
          <div style="background:#f8f9fa;padding:1rem;text-align:center;font-size:0.8rem;color:#aaa;">© 2026 Rentify Car Rentals</div>
        </div>
      `
    }).catch(e => console.error('Payment email failed:', e.message));

    res.json({ success: true, message: 'Payment verified. Booking marked as Paid.', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Refund a paid booking (admin)
// @route   POST /api/payment/refund/:bookingId
const refundPayment = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.bookingId, {
      include: [{ model: require('../models').User, as: 'user' }]
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.payment_status !== 'Paid') return res.status(400).json({ message: 'Only paid bookings can be refunded' });
    if (!booking.transaction_id) return res.status(400).json({ message: 'No transaction ID found for this booking' });

    // Initiate Razorpay refund
    const refund = await razorpay.payments.refund(booking.transaction_id, {
      amount: Math.round(parseFloat(booking.final_price) * 100),
      notes: { reason: req.body.reason || 'Admin initiated refund', bookingId: booking.booking_id }
    });

    booking.payment_status = 'Refunded';
    booking.booking_status = 'Cancelled';
    await booking.save();

    // Send refund email
    sendEmail({
      email: booking.user?.email,
      subject: '↩️ Refund Processed — Rentify',
      html: `<div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:2rem;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <h2 style="color:#0d6efd;">🚗 RENTIFY — Refund Confirmation</h2>
        <p>Hello <strong>${booking.user?.name}</strong>, your refund for Booking <strong>#RNT-${booking.booking_id}</strong> has been initiated.</p>
        <p>Refund of <strong style="color:#198754;">Rs. ${booking.final_price}</strong> will be credited to your original payment source within <strong>5-7 business days</strong>.</p>
        <p>Refund ID: <code>${refund.id}</code></p>
        <p style="color:#555;font-size:0.9rem;">Contact us at rentify@gmail.com for any queries.</p>
      </div>`
    }).catch(e => console.error('Refund email failed:', e.message));

    res.json({ success: true, message: 'Refund initiated successfully', refund });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createOrder, verifyPayment, refundPayment };
