import { Pool } from 'pg';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.NEXT_PUBLIC_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Function to ensure the 'loc' table exists
const checkAndCreateTable = async () => {
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

// POST request handler to store or update location and UPI ID
export async function POST(req) {
  await checkAndCreateTable(); // Ensure table exists

  const { latitude, longitude, upiId } = await req.json(); // Parse request body

  if (!latitude || !longitude || !upiId) {
    return new Response(
      JSON.stringify({ message: 'Latitude, longitude, and UPI ID are required.' }),
      { status: 400 }
    );
  }

  try {
    // Check if the upi_id already exists
    const existingUser = await pool.query(
      'SELECT * FROM loc WHERE upi_id = $1',
      [upiId]
    );

    if (existingUser.rows.length > 0) {
      // If exists, update the latitude and longitude
      await pool.query(
        'UPDATE loc SET latitude = $1, longitude = $2, timestamp = CURRENT_TIMESTAMP WHERE upi_id = $3',
        [latitude, longitude, upiId]
      );

      return new Response(
        JSON.stringify({ message: 'Location updated successfully.' }),
        { status: 200 }
      );
    } else {
      // If does not exist, insert new record
      await pool.query(
        'INSERT INTO loc (latitude, longitude, upi_id) VALUES ($1, $2, $3)',
        [latitude, longitude, upiId]
      );

      return new Response(
        JSON.stringify({ message: 'Location and UPI ID saved successfully.' }),
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error saving location and UPI ID:', error);
    return new Response(JSON.stringify({ message: 'Server error' }), { status: 500 });
  }
}