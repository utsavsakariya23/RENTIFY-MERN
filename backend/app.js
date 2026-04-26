const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, sequelize } = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cars', require('./routes/carRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/otp', require('./routes/otpRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/citypoints', require('./routes/cityPointRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/maintenance', require('./routes/maintenanceRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));


// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Sync updated models to database (alter: true updates columns without dropping data)
    // Manually handle the image_url migration for Postgres to avoid "cannot be cast automatically" error
    try {
      // Check if it's already JSONB to avoid nesting arrays
      const [results] = await sequelize.query(`
        SELECT data_type FROM information_schema.columns 
        WHERE table_name = 'cars' AND column_name = 'image_url';
      `);
      if (results.length > 0 && results[0].data_type !== 'jsonb') {
        await sequelize.query(`
          ALTER TABLE cars 
          ALTER COLUMN image_url TYPE JSONB 
          USING CASE 
            WHEN image_url IS NULL THEN '[]'::jsonb
            ELSE jsonb_build_array(image_url)
          END
        `);
        console.log('✅ image_url column migrated to JSONB');
      }
    } catch (err) {
      // If column doesn't exist or already migrated, skip
    }

    // Manually handle the status migration for Postgres
    try {
      // 1. Drop existing default to avoid cast errors
      try {
        await sequelize.query('ALTER TABLE cars ALTER COLUMN status DROP DEFAULT');
      } catch (e) {}

      // 2. Create the enum type if it doesn't exist
      await sequelize.query(`
        DO $$ 
        BEGIN 
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_cars_status') THEN 
            CREATE TYPE enum_cars_status AS ENUM('active', 'deactive'); 
          END IF; 
        END $$;
      `);

      // 3. Perform the cast
      await sequelize.query(`
        ALTER TABLE cars 
        ALTER COLUMN status TYPE enum_cars_status 
        USING (CASE 
          WHEN status::text IN ('Available', 'Rented', 'active') THEN 'active'::enum_cars_status
          ELSE 'deactive'::enum_cars_status
        END);
      `);
      console.log('✅ status column migrated to ENUM');
    } catch (err) {
      // console.log('Status migration skipped:', err.message);
    }

    await sequelize.sync({ alter: true });
    console.log('✅ Database models synced');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`❌ Server error: ${error.message}`);
  }
};
startServer();
