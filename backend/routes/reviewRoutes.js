const express = require('express');
const router = express.Router();
const { getLatestReviews, getReviewsByCar, createReview } = require('../controllers/ReviewController');
const { protect } = require('../middlewares/auth');

router.get('/latest', getLatestReviews);
router.get('/car/:carId', getReviewsByCar);
router.post('/', protect, createReview);

module.exports = router;
