const express = require('express');
const router = express.Router();
const { submitContactMessage, getAllContactMessages, markMessageRead, replyToMessage } = require('../controllers/ContactController');
const { protect, admin } = require('../middlewares/auth');

router.post('/', submitContactMessage);
router.get('/', protect, admin, getAllContactMessages);
router.put('/:id/read', protect, admin, markMessageRead);
router.post('/:id/reply', protect, admin, replyToMessage);

module.exports = router;
