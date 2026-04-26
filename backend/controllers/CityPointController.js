const { CityPoint } = require('../models');
const { Op } = require('sequelize');

// Get all city points
const getAllCityPoints = async (req, res) => {
  try {
    const cityPoints = await CityPoint.findAll({
      order: [['city_name', 'ASC'], ['point_name', 'ASC']]
    });
    res.json(cityPoints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unique cities
const getCities = async (req, res) => {
  try {
    const cities = await CityPoint.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('city_name')), 'city_name']],
      order: [['city_name', 'ASC']]
    });
    // If sequelize is not available in the context of this model file's imports for fn/col
    // Alternatively, just fetch all and filter in JS if the list is small, or fix imports
    res.json(cities);
  } catch (error) {
    // Fallback if sequelize.fn fails due to import issues
    try {
        const allPoints = await CityPoint.findAll({ attributes: ['city_name'] });
        const uniqueCities = [...new Set(allPoints.map(p => p.city_name))].sort().map(name => ({ city_name: name }));
        res.json(uniqueCities);
    } catch (innerError) {
        res.status(500).json({ message: error.message });
    }
  }
};

// Get points by city
const getPointsByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const points = await CityPoint.findAll({
      where: { city_name: city },
      order: [['point_name', 'ASC']]
    });
    res.json(points);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add city point (Admin)
const addCityPoint = async (req, res) => {
  try {
    const { cityName } = req.body;
    
    if (!cityName) {
      return res.status(400).json({ message: 'City name is required' });
    }

    // Check if city already exists
    const existing = await CityPoint.findOne({ where: { city_name: cityName } });
    if (existing) {
      return res.status(400).json({ message: 'City already exists' });
    }

    const newPoint = await CityPoint.create({
      city_name: cityName,
      point_name: 'Main' // Default placeholder
    });
    
    res.status(201).json(newPoint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete city point (Admin)
const deleteCityPoint = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await CityPoint.destroy({
      where: { city_point_id: id }
    });
    
    if (deleted) {
      res.json({ message: 'City point deleted successfully' });
    } else {
      res.status(404).json({ message: 'City point not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllCityPoints,
  getCities,
  getPointsByCity,
  addCityPoint,
  deleteCityPoint
};
