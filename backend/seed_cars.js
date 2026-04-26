const Car = require('./models/Car');

const seedCars = async () => {
  try {
    await Car.bulkCreate([
      {
        name: 'Civic',
        brand: 'Honda',
        price_per_day: 1500,
        fuel_type: 'Petrol',
        transmission: 'Automatic',
        status: 'Available',
        image_url: '/assets/img/honda_civic.webp'
      },
      {
        name: 'Corolla',
        brand: 'Toyota',
        price_per_day: 1800,
        fuel_type: 'Diesel',
        transmission: 'Manual',
        status: 'Available',
        image_url: '/assets/img/toyota_corolla.webp'
      },
      {
        name: 'X-Trail',
        brand: 'Nissan',
        price_per_day: 2500,
        fuel_type: 'Petrol',
        transmission: 'Automatic',
        status: 'Available',
        image_url: '/assets/img/nissan_x_trail.webp'
      }
    ]);
    console.log('Dummy cars seeded successfully.');
  } catch (err) {
    console.error('Error seeding cars:', err);
  } finally {
    process.exit();
  }
};

seedCars();
