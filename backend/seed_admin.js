const User = require('./models/User');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  try {
    await User.destroy({ where: { email: 'admin@rentify.com' } });
    await User.create({
      name: 'Admin User',
      email: 'admin@rentify.com',
      password: 'admin123',
      phone_number: '1234567890',
      role: 'Admin'
    });
    console.log('Admin user seeded successfully. Email: admin@rentify.com, Password: admin123');
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      console.log('Admin user already exists.');
    } else {
      console.error('Error seeding admin:', err);
    }
  } finally {
    process.exit();
  }
};

seedAdmin();
