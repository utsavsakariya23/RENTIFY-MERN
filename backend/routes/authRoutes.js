const express = require('express');
const router = express.Router();
const { registerUser, authUser, getUserProfile, updateUserProfile, forgotPassword, resetPassword, checkUsername } = require('../controllers/AuthController');
const { protect } = require('../middlewares/auth');

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/check-username', checkUsername);

module.exports = router;
