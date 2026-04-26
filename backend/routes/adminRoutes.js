const express = require('express');
const router = express.Router();
const {
  getCustomers, deleteCustomer, getAllBookings, updateBookingStatus, updatePaymentStatus,
  getCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon,
  getReviews, deleteReview, toggleLike, replyToReview, sendCouponToUser
} = require('../controllers/AdminController');
const { protect, admin } = require('../middlewares/auth');

// All admin routes require authentication + admin role
router.use(protect, admin);

// Customers
router.get('/customers', getCustomers);
router.delete('/customers/:id', deleteCustomer);

// Bookings
router.get('/bookings', getAllBookings);
router.put('/bookings/:id/status', updateBookingStatus);
router.put('/bookings/:id/payment', updatePaymentStatus);

// Coupons
router.route('/coupons').get(getCoupons).post(createCoupon);
router.route('/coupons/:id').put(updateCoupon).delete(deleteCoupon);

// Reviews
router.route('/reviews').get(getReviews);
router.delete('/reviews/:id', deleteReview);
router.put('/reviews/:id/like', toggleLike);
router.put('/reviews/:id/reply', replyToReview);

// Send Coupon Email
router.post('/coupons/:id/send', require('../controllers/AdminController').sendCouponToUser);

module.exports = router;
