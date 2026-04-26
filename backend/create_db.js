const { Client } = require('pg');
require('dotenv').config();

const createDB = async () => {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    await client.connect();
    await client.query('CREATE DATABASE rentify');
    console.log('Database "rentify" created successfully');
  } catch (err) {
    if (err.code === '42P04') {
      console.log('Database "rentify" already exists');
    } else {
      console.error('Error creating database:', err);
    }
  } finally {
    await client.end();
  }
};

createDB();
