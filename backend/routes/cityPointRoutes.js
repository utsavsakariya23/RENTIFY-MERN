const express = require('express');
const router = express.Router();
const { 
  getAllCityPoints, 
  getCities, 
  getPointsByCity, 
  addCityPoint, 
  deleteCityPoint 
} = require('../controllers/CityPointController');
const { protect, admin } = require('../middlewares/auth');

// Public routes
router.get('/', getAllCityPoints);
router.get('/cities', getCities);
router.get('/points/:city', getPointsByCity);

// Admin-only routes
router.post('/', protect, admin, addCityPoint);
router.delete('/:id', protect, admin, deleteCityPoint);

module.exports = router;

