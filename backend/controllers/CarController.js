const { Car, Review, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all cars
// @route   GET /api/cars
const getCars = async (req, res) => {
  try {
    const { keyword, fuelType, transmission, maxPrice, status, city } = req.query;
    
    let whereClause = {};
    if (status) whereClause.status = status;
    if (fuelType) whereClause.fuel_type = fuelType;
    if (transmission) whereClause.transmission = transmission;
    if (city) whereClause.city = city;
    
    if (maxPrice) {
      whereClause.price_per_day = { [Op.lte]: parseFloat(maxPrice) };
    }

    if (keyword) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${keyword}%` } },
        { brand: { [Op.iLike]: `%${keyword}%` } },
        { city: { [Op.iLike]: `%${keyword}%` } }
      ];
    }

    const cars = await Car.findAll({
      where: whereClause,
      include: [
        {
          model: Review,
          as: 'reviews',
          include: [{ model: User, as: 'user', attributes: ['name'] }]
        }
      ]
    });
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single car by id
// @route   GET /api/cars/:id
const getCarById = async (req, res) => {
  try {
    const car = await Car.findByPk(req.params.id, {
      include: [
        {
          model: Review,
          as: 'reviews',
          include: [{ model: User, as: 'user', attributes: ['name'] }]
        }
      ]
    });

    if (car) {
      res.json(car);
    } else {
      res.status(404).json({ message: 'Car not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a car
// @route   POST /api/cars
// @access  Private/Admin
const createCar = async (req, res) => {
  const { 
    name, brand, city, price_per_day, fuel_type, transmission, 
    image_url, car_type, seats, model_year, address, delivery_fee 
  } = req.body;

  try {
    // Ensure image_url is an array
    const images = Array.isArray(image_url) ? image_url : (image_url ? [image_url] : []);

    const car = await Car.create({
      name,
      brand,
      city,
      price_per_day,
      fuel_type,
      transmission,
      image_url: images,
      car_type,
      seats,
      model_year,
      address,
      delivery_fee,
      status: 'active'
    });

    res.status(201).json(car);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Invalid car data' });
  }
};

// @desc    Update a car
// @route   PUT /api/cars/:id
// @access  Private/Admin
const updateCar = async (req, res) => {
  const { 
    name, brand, city, price_per_day, fuel_type, transmission, 
    image_url, status, car_type, seats, model_year, address, delivery_fee 
  } = req.body;

  try {
    const car = await Car.findByPk(req.params.id);

    if (car) {
      if (image_url) {
        car.image_url = Array.isArray(image_url) ? image_url : [image_url];
      }
      
      car.name = name || car.name;
      car.brand = brand || car.brand;
      car.city = city || car.city;
      car.price_per_day = price_per_day || car.price_per_day;
      car.fuel_type = fuel_type || car.fuel_type;
      car.transmission = transmission || car.transmission;
      car.status = status || car.status;
      car.car_type = car_type || car.car_type;
      car.seats = seats || car.seats;
      car.model_year = model_year || car.model_year;
      car.address = address || car.address;
      car.delivery_fee = delivery_fee !== undefined ? delivery_fee : car.delivery_fee;

      const updatedCar = await car.save();
      res.json(updatedCar);
    } else {
      res.status(404).json({ message: 'Car not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a car
// @route   DELETE /api/cars/:id
// @access  Private/Admin
const deleteCar = async (req, res) => {
  try {
    const car = await Car.findByPk(req.params.id);

    if (car) {
      await car.destroy();
      res.json({ message: 'Car removed' });
    } else {
      res.status(404).json({ message: 'Car not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar
};
