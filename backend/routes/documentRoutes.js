const express = require('express');
const router = express.Router();
const { 
  getMyDocuments, 
  uploadDocument, 
  getAllDocuments, 
  verifyDocument 
} = require('../controllers/DocumentController');
const { protect, admin } = require('../middlewares/auth');

// User routes
router.get('/my', protect, getMyDocuments);
router.post('/upload', protect, uploadDocument);

// Admin routes
router.get('/admin/all', protect, admin, getAllDocuments);
router.put('/admin/:id/verify', protect, admin, verifyDocument);

module.exports = router;
