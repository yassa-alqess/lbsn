import dotenv from 'dotenv';

try {
  dotenv.config();
} catch (err) {
  console.error('Error loading proper .env file'); // can't use logger here, as it's not properly configured yet.
  process.exit(1);
}


