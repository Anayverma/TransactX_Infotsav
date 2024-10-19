// pages/api/loc.js
import { Pool } from 'pg';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.NEXT_PUBLIC_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Function to ensure the 'loc' table exists
const checkAndCreateLocTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS loc (
      id SERIAL PRIMARY KEY,
      latitude NUMERIC NOT NULL,
      longitude NUMERIC NOT NULL,
      upi_id VARCHAR(50) UNIQUE NOT NULL,
      timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(createTableQuery);
    console.log('Location table checked/created successfully.');
  } catch (error) {
    console.error('Error creating location table:', error);
  }
};

// Function to ensure the 'notifications' table exists
const checkAndCreateNotificationsTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(50) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(createTableQuery);
    console.log('Notifications table checked/created successfully.');
  } catch (error) {
    console.error('Error creating notifications table:', error);
  }
};

// Helper function to find nearby users
const findNearbyUsers = async (latitude, longitude, limit = 10) => {
  const query = `
    SELECT upi_id, latitude, longitude
    FROM loc
    WHERE ABS(latitude - $1) <= 0.1 AND ABS(longitude - $2) <= 0.1
    LIMIT $3;
  `;

  try {
    const result = await pool.query(query, [latitude, longitude, limit]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching nearby users:', error);
    throw error;
  }
};

// POST request handler to save location and return nearby users
export async function POST(req) {
  await checkAndCreateLocTable(); // Ensure location table exists
  await checkAndCreateNotificationsTable(); // Ensure notifications table exists

  const { latitude, longitude, upiId } = await req.json(); // Parse request body

  if (!latitude || !longitude || !upiId) {
    return new Response(
      JSON.stringify({ message: 'Latitude, longitude, and UPI ID are required.' }),
      { status: 400 }
    );
  }

  try {
    // Insert data into the 'loc' table

    // Retrieve nearby users
    const nearbyUsers = await findNearbyUsers(latitude, longitude);

    // Create notification messages for nearby users
    for (const user of nearbyUsers) {
      const message = `User ${upiId} is nearby. Latitude: ${user.latitude}, Longitude: ${user.longitude}`;
      await pool.query(
        'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
        [user.upi_id, message]
      );
      console.log(`Notification created for ${user.upi_id}: ${message}`);
    }

    return new Response(
      JSON.stringify({
        message: 'Location saved successfully.',
        nearbyUsers,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving location:', error);
    return new Response(
      JSON.stringify({ message: 'Server error' }),
      { status: 500 }
    );
  }
}