const { Booking, Car, User, Review, Coupon } = require('../models');
const { Op } = require('sequelize');
const sendEmail = require('../utils/sendEmail');

const includeOptions = [
  { model: Car, as: 'car', attributes: ['car_id', 'name', 'brand', 'image_url', 'price_per_day', 'car_type', 'seats', 'model_year', 'address', 'delivery_fee'] },
  { model: User, as: 'user', attributes: ['user_id', 'name', 'email', 'phone_number'] }
];

// @desc    Create a booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  const { car_id, start_date, end_date, total_days, pickup_location, drop_location,
    total_price, discount_amount, final_price, coupon_code, payment_method } = req.body;
  try {
    const car = await Car.findByPk(car_id);
    if (!car) return res.status(404).json({ message: 'Car not found' });
    if (car.status === 'Maintenance') return res.status(400).json({ message: 'Car is currently under maintenance' });

    // Check for overlapping bookings
    const overlapping = await Booking.findOne({
      where: {
        car_id,
        booking_status: { [Op.ne]: 'Cancelled' },
        [Op.and]: [
          { start_date: { [Op.lte]: end_date } },
          { end_date: { [Op.gte]: start_date } }
        ]
      }
    });

    if (overlapping) {
      return res.status(400).json({ 
        message: `Already booked on date ${overlapping.start_date} to ${overlapping.end_date}` 
      });
    }

    const booking = await Booking.create({
      user_id: req.user.user_id, car_id, start_date, end_date,
      total_days: total_days || 1,
      pickup_location, drop_location,
      is_permanent_location: req.body.is_permanent_location || false,
      delivery_fee: req.body.delivery_fee || 0,
      total_price, discount_amount: discount_amount || 0,
      final_price: final_price || total_price,
      coupon_code, payment_method: payment_method || 'Cash',
      payment_status: 'Unpaid', booking_status: 'Pending'
    });

    // car.status = 'Booked'; // Removed to allow multiple bookings on different dates
    // await car.save();

    // Send confirmation email (async, non-blocking)
    sendEmail({
      email: req.user.email,
      subject: '🚗 Booking Confirmed — Rentify Car Rentals',
      html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          <div style="background:linear-gradient(135deg,#0d6efd,#0a58ca);color:#fff;padding:2rem;text-align:center;">
            <div style="font-size:2rem;font-weight:800;letter-spacing:-1px;">🚗 RENTIFY</div>
            <div style="font-size:0.85rem;opacity:0.8;margin-top:4px;">Car Rental Services — India</div>
            <div style="background:rgba(255,255,255,0.15);border-radius:50px;display:inline-block;padding:8px 24px;margin-top:16px;font-size:1.1rem;font-weight:700;">✅ BOOKING CONFIRMED</div>
          </div>
          <div style="padding:2rem;">
            <p style="font-size:1rem;color:#333;">Hello <strong>${req.user.name || 'Customer'}</strong>,</p>
            <p style="color:#555;line-height:1.6;">Your booking for <strong>${car.brand} ${car.name}</strong> has been successfully received. Below are your booking details:</p>

            <table style="width:100%;border-collapse:collapse;margin:1.5rem 0;border-radius:8px;overflow:hidden;">
              <tr style="background:#f0f4ff;">
                <td style="padding:12px 16px;font-weight:700;color:#0d6efd;width:40%;">🔖 Booking ID</td>
                <td style="padding:12px 16px;font-weight:700;color:#333;">#RNT-${booking.booking_id}</td>
              </tr>
              <tr style="background:#fff;">
                <td style="padding:12px 16px;font-weight:600;color:#555;">🚗 Vehicle</td>
                <td style="padding:12px 16px;color:#333;">${car.brand} ${car.name}</td>
              </tr>
              <tr style="background:#f9f9f9;">
                <td style="padding:12px 16px;font-weight:600;color:#555;">📅 Pickup Date</td>
                <td style="padding:12px 16px;color:#333;">${start_date}</td>
              </tr>
              <tr style="background:#fff;">
                <td style="padding:12px 16px;font-weight:600;color:#555;">📅 Return Date</td>
                <td style="padding:12px 16px;color:#333;">${end_date}</td>
              </tr>
              <tr style="background:#f9f9f9;">
                <td style="padding:12px 16px;font-weight:600;color:#555;">📍 Pickup Location</td>
                <td style="padding:12px 16px;color:#333;">${req.body.pickup_location || 'Car Permanent Location'}</td>
              </tr>
              <tr style="background:#fff;">
                <td style="padding:12px 16px;font-weight:600;color:#555;">💳 Payment Method</td>
                <td style="padding:12px 16px;color:#333;">${payment_method || 'Cash'}</td>
              </tr>
              <tr style="background:#e8f5e9;">
                <td style="padding:14px 16px;font-weight:800;color:#198754;font-size:1.05rem;">💰 Total Amount</td>
                <td style="padding:14px 16px;font-weight:800;color:#198754;font-size:1.1rem;">Rs. ${final_price || total_price}</td>
              </tr>
            </table>

            <div style="background:#fff8e1;border-left:4px solid #ffc107;padding:12px 16px;border-radius:4px;margin-bottom:1.5rem;">
              <p style="margin:0;font-size:0.9rem;color:#856404;">⚠️ <strong>Next Steps:</strong> Our team will review and confirm your booking shortly. You'll receive a second email once confirmed.</p>
            </div>

            <p style="color:#555;font-size:0.9rem;">Have questions? Contact us at <a href="mailto:rentify@gmail.com" style="color:#0d6efd;text-decoration:none;">rentify@gmail.com</a></p>
          </div>
          <div style="background:#f8f9fa;padding:1rem 2rem;text-align:center;border-top:1px solid #eee;">
            <p style="margin:0;font-size:0.8rem;color:#aaa;">© 2026 Rentify Car Rentals. All rights reserved.</p>
          </div>
        </div>
      `
    }).catch(mailErr => console.error('Email send failed:', mailErr.message));


    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in user's bookings
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { user_id: req.user.user_id },
      include: includeOptions,
      order: [['created_at', 'DESC']]
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: { booking_id: req.params.id },
      include: includeOptions
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    // Allow owner or admin
    if (booking.user_id !== req.user.user_id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel booking (customer)
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: { booking_id: req.params.id, user_id: req.user.user_id },
      include: [{ model: Car, as: 'car' }]
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (!['Pending', 'Confirmed'].includes(booking.booking_status)) {
      return res.status(400).json({ message: 'Cannot cancel this booking' });
    }
    booking.booking_status = 'Cancelled';
    await booking.save();

    // Send cancellation email (async)
    const user = await User.findByPk(req.user.user_id);
    if (user?.email) {
      sendEmail({
        email: user.email,
        subject: '❌ Booking Cancelled — Rentify',
        html: `
          <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
            <div style="background:linear-gradient(135deg,#dc3545,#b02a37);color:#fff;padding:2rem;text-align:center;">
              <div style="font-size:2rem;font-weight:800;">🚗 RENTIFY</div>
              <div style="margin-top:8px;">Booking Cancellation</div>
            </div>
            <div style="padding:2rem;">
              <p>Hello <strong>${user.name}</strong>,</p>
              <p>Your booking <strong>#RNT-${booking.booking_id}</strong> for <strong>${booking.car?.brand} ${booking.car?.name}</strong> has been cancelled.</p>
              ${booking.payment_status === 'Paid' && booking.payment_method === 'Online' ? 
                '<p style="color:#0d6efd;font-weight:700;">💰 Since you paid online, a refund request will be processed by our admin team. You will receive a separate refund confirmation email shortly.</p>' 
                : ''}
              <p style="color:#555;font-size:0.9rem;">If you didn't request this cancellation, please contact us immediately.</p>
            </div>
            <div style="background:#f8f9fa;padding:1rem;text-align:center;font-size:0.8rem;color:#aaa;">© 2026 Rentify Car Rentals</div>
          </div>
        `
      }).catch(e => console.error('Cancel email failed:', e.message));
    }

    res.json({ message: 'Booking cancelled successfully', needsRefund: booking.payment_status === 'Paid' && booking.payment_method === 'Online' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit a review for a completed booking
// @route   POST /api/bookings/review
// @access  Private
const submitReview = async (req, res) => {
  const { bookingId, rating, comment } = req.body;
  try {
    const booking = await Booking.findOne({
      where: { booking_id: bookingId, user_id: req.user.user_id, booking_status: 'Completed' }
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found or not eligible for review' });

    const existing = await Review.findOne({ where: { booking_id: bookingId } });
    if (existing) return res.status(400).json({ message: 'Review already submitted for this booking' });

    const review = await Review.create({
      user_id: req.user.user_id,
      car_id: booking.car_id,
      booking_id: bookingId,
      rating,
      comment
    });
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Admin
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: includeOptions,
      order: [['created_at', 'DESC']]
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status (Admin)
// @route   PUT /api/bookings/:id/status
// @access  Admin
const updateBookingStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.booking_status = status || booking.booking_status;
    // car.status update logic removed
    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/bookings/admin/stats
// @access  Admin
const getAdminStats = async (req, res) => {
  try {
    const totalBookings = await Booking.count();
    const totalUsers = await User.count({ where: { role: 'Customer' } });
    const paidBookings = await Booking.findAll({ where: { payment_status: 'Paid' } });
    const totalRevenue = paidBookings.reduce((sum, b) => sum + parseFloat(b.final_price || 0), 0);
    const totalCars = await Car.count();
    const activeCars = await Car.count({ 
      where: { status: 'active' } 
    });
    res.json({ totalBookings, totalUsers, totalRevenue, totalCars, activeCars });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recent bookings for dashboard
// @route   GET /api/bookings/admin/recent
// @access  Admin
const getRecentBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: includeOptions,
      order: [['created_at', 'DESC']],
      limit: 10
    });
    // Flatten for dashboard table
    const result = bookings.map(b => ({
      booking_id: b.booking_id,
      user_name: b.user?.name,
      car_name: `${b.car?.brand} ${b.car?.name}`,
      start_date: b.start_date,
      end_date: b.end_date,
      total_price: b.final_price,
      status: b.booking_status
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get suggested coupons for booking page
// @route   GET /api/bookings/coupons/suggestions
// @access  Public or Private
const getSuggestedCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.findAll({
      where: {
        is_active: true,
        show_in_suggestions: true,
        [Op.or]: [
          { expiry_date: null },
          { expiry_date: { [Op.gte]: new Date() } }
        ]
      },
      attributes: ['code', 'discount_percent', 'expiry_date']
    });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking, getMyBookings, getBookingById, cancelBooking,
  submitReview, getAllBookings, updateBookingStatus,
  getAdminStats, getRecentBookings, getSuggestedCoupons
};
