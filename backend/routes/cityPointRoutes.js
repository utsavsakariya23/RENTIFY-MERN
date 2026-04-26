const express = require('express');
const router = express.Router();
const { 
  getAllCityPoints, 
  getCities, 
  getPointsByCity, 
  addCityPoint, 
  deleteCityPoint 
} = require('../controllers/CityPointController');
// Import middleware for auth if needed, but for now I'll just define the routes
// Assuming there's a middleware to check if user is admin
// const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getAllCityPoints);
router.get('/cities', getCities);
router.get('/points/:city', getPointsByCity);
router.post('/', addCityPoint); // Should be protected by admin middleware in a real app
router.delete('/:id', deleteCityPoint); // Should be protected by admin middleware in a real app

module.exports = router;
