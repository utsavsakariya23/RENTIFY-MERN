const express = require('express');
const router = express.Router();
const {
  createBooking, getMyBookings, getBookingById, cancelBooking,
  submitReview, getAllBookings, updateBookingStatus,
  getAdminStats, getRecentBookings, getSuggestedCoupons
} = require('../controllers/BookingController');
const { validateCoupon } = require('../controllers/AdminController');
const { protect, admin } = require('../middlewares/auth');

// Admin stats & recent (must be before /:id)
router.get('/admin/stats', protect, admin, getAdminStats);
router.get('/admin/recent', protect, admin, getRecentBookings);

// Coupon suggestions (public or private, placed before /:id)
router.get('/coupons/suggestions', getSuggestedCoupons);

// Customer routes
router.get('/my', protect, getMyBookings);
router.post('/review', protect, submitReview);
router.put('/:id/cancel', protect, cancelBooking);
router.post('/validate-coupon', protect, validateCoupon);

// Admin routes
router.get('/', protect, admin, getAllBookings);
router.put('/:id/status', protect, admin, updateBookingStatus);

// Single booking (owner or admin)
router.get('/:id', protect, getBookingById);

// Create booking
router.post('/', protect, createBooking);

module.exports = router;
