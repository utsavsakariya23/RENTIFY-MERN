const { User, Booking, Car, Review, Coupon, ContactMessage } = require('../models');
const { Op } = require('sequelize');
const sendEmail = require('../utils/sendEmail');

const includeBookingOptions = [
  { model: Car, as: 'car', attributes: ['car_id', 'name', 'brand', 'image_url'] },
  { model: User, as: 'user', attributes: ['user_id', 'name', 'email', 'phone_number'] }
];

// ================== CUSTOMERS ==================

// @desc    Get all customers
// @route   GET /api/admin/customers
const getCustomers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @desc    Delete a customer
// @route   DELETE /api/admin/customers/:id
const deleteCustomer = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Prevent self-deletion
    if (user.user_id === req.user.user_id) {
      return res.status(400).json({ message: 'You cannot delete your own account from here' });
    }

    await user.destroy();
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ================== BOOKINGS ==================

// @desc    Get all bookings (admin view, with User & Car)
// @route   GET /api/admin/bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: includeBookingOptions,
      order: [['created_at', 'DESC']]
    });
    res.json(bookings);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @desc    Update booking status (admin)
// @route   PUT /api/admin/bookings/:id/status
const updateBookingStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    booking.booking_status = status;
    if (['Completed', 'Cancelled'].includes(status)) {
      await Car.update({ status: 'active' }, { where: { car_id: booking.car_id } });
    }
    await booking.save();
    res.json(booking);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @desc    Update payment status (admin)
// @route   PUT /api/admin/bookings/:id/payment
const updatePaymentStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    booking.payment_status = status || 'Paid';
    await booking.save();
    res.json(booking);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ================== COUPONS ==================

// @desc    Get all coupons
// @route   GET /api/admin/coupons
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.findAll({ order: [['createdAt', 'DESC']] });
    res.json(coupons);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @desc    Create coupon
// @route   POST /api/admin/coupons
const createCoupon = async (req, res) => {
  const { code, discount_percent, expiry_date, is_active } = req.body;
  try {
    const coupon = await Coupon.create({ code: code.toUpperCase(), discount_percent, expiry_date, is_active });
    res.status(201).json(coupon);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @desc    Update coupon
// @route   PUT /api/admin/coupons/:id
const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    await coupon.update(req.body);
    res.json(coupon);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @desc    Delete coupon
// @route   DELETE /api/admin/coupons/:id
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    await coupon.destroy();
    res.json({ message: 'Coupon deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Validate coupon (customer use)
const validateCoupon = async (req, res) => {
  const { code } = req.body;
  try {
    const coupon = await Coupon.findOne({
      where: {
        code: code.toUpperCase(),
        is_active: true,
        [Op.or]: [
          { expiry_date: null },
          { expiry_date: { [Op.gte]: new Date() } }
        ]
      }
    });

    if (!coupon) return res.status(404).json({ message: 'Invalid or expired coupon' });

    // Check specific user assignment
    if (coupon.assigned_user_email && coupon.assigned_user_email !== req.user.email) {
      return res.status(403).json({ message: 'This coupon is not valid for your account' });
    }

    // Check usage limits
    const { CouponUsage } = require('../models');
    const userUsages = await CouponUsage.count({ where: { coupon_id: coupon.coupon_id, user_id: req.user.user_id } });
    if (userUsages >= coupon.max_uses) {
      return res.status(403).json({ message: `You have reached the maximum usage limit (${coupon.max_uses}) for this coupon` });
    }

    res.json({ discount_percent: coupon.discount_percent, code: coupon.code, coupon_id: coupon.coupon_id });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @desc    Email coupon to users based on target
// @route   POST /api/admin/coupons/:id/send
const sendCouponToUser = async (req, res) => {
  const { targetType, targetEmail } = req.body;
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    
    let targetUsers = [];
    
    if (targetType === 'Specific') {
      const user = await User.findOne({ where: { email: targetEmail } });
      if (!user) return res.status(404).json({ message: 'No registered user found with this email' });
      targetUsers = [user];
      
      // Update coupon assignment if only sending to 1 specific user
      coupon.assigned_user_email = targetEmail;
      await coupon.save();
    } else {
      // For bulk sends, fetch all customers
      const allCustomers = await User.findAll({ where: { role: 'Customer' }, include: [{ model: Booking, as: 'bookings' }] });
      
      if (targetType === 'All') {
        targetUsers = allCustomers;
      } else if (targetType === 'MoreThan3') {
        targetUsers = allCustomers.filter(u => u.bookings && u.bookings.length > 3);
      } else if (targetType === 'Zero') {
        targetUsers = allCustomers.filter(u => !u.bookings || u.bookings.length === 0);
      }
      
      // For bulk, don't restrict the coupon to one person
      coupon.assigned_user_email = null;
      await coupon.save();
    }

    if (targetUsers.length === 0) return res.status(400).json({ message: 'No users matched the criteria' });

    // Send emails in parallel but safely
    const emailPromises = targetUsers.map(user => 
      sendEmail({
        email: user.email,
        subject: '🎁 Exclusive Rentify Discount just for you!',
        html: `
          <div style="font-family:'Segoe UI',sans-serif;max-width:500px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
            <div style="background:linear-gradient(135deg,#6610f2,#e83e8c);color:#fff;padding:2rem;text-align:center;">
              <div style="font-size:1.8rem;font-weight:800;">🚗 RENTIFY</div>
              <div style="margin-top:8px;">You received a special offer!</div>
            </div>
            <div style="padding:2rem;text-align:center;">
              <p>Hello <strong>${user.name}</strong>,</p>
              <p>Use the code below on your next booking to get <strong>${coupon.discount_percent}% OFF</strong>!</p>
              <div style="display:inline-block;background:#f8f9fa;border:2px dashed #6610f2;border-radius:12px;padding:1rem 2rem;margin:1rem 0;">
                <div style="font-size:2rem;font-weight:800;letter-spacing:4px;color:#6610f2;">${coupon.code}</div>
              </div>
              ${coupon.expiry_date ? `<p class="small text-danger">Valid until ${coupon.expiry_date}</p>` : ''}
            </div>
            <div style="background:#f8f9fa;padding:1rem;text-align:center;font-size:0.8rem;color:#aaa;">© 2026 Rentify Car Rentals</div>
          </div>
        `
      }).catch(e => console.error(`Failed to send to ${user.email}:`, e.message))
    );

    await Promise.all(emailPromises);

    res.json({ message: `Coupon sent successfully to ${targetUsers.length} user(s)!` });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ================== REVIEWS ==================

// @desc    Get all reviews (admin)
// @route   GET /api/admin/reviews
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [
        { model: User, as: 'user', attributes: ['name'] },
        { model: Car, as: 'car', attributes: ['name', 'brand'] }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(reviews);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @desc    Delete review (admin)
// @route   DELETE /api/admin/reviews/:id
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    await review.destroy();
    res.json({ message: 'Review deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @desc    Toggle like on review
// @route   PUT /api/admin/reviews/:id/like
const toggleLike = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    review.is_liked = !review.is_liked;
    await review.save();
    res.json({ is_liked: review.is_liked });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @desc    Reply to review
// @route   PUT /api/admin/reviews/:id/reply
const replyToReview = async (req, res) => {
  const { reply } = req.body;
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    review.admin_reply = reply;
    await review.save();
    res.json({ admin_reply: review.admin_reply });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ================== CONTACT MESSAGES ==================

// @desc    Get all contact messages
// @route   GET /api/contact — handled in contactRoutes
// (exposed here for reuse if needed)

module.exports = {
  getCustomers, deleteCustomer, getAllBookings, updateBookingStatus, updatePaymentStatus,
  getCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon, sendCouponToUser,
  getReviews, deleteReview, toggleLike, replyToReview
};
