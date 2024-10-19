import { Pool } from 'pg';

// Create a connection pool to the PostgreSQL database
const pool = new Pool({
  connectionString: process.env.NEXT_PUBLIC_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Helper function to get wallets associated with a username
async function getWalletsByUsername(username) {
  try {
    console.log("uuu",username)
    const query = 'SELECT wallets FROM users WHERE username = $1;';
    const res = await pool.query(query, [username]);
    console.log("resss",res)
    if (res.rows.length > 0) {
      // Parse wallets as an array (assuming it's stored as JSON in the DB)
      return JSON.parse(res.rows[0].wallets);
    } else {
      throw new Error('User not found');
    }
  } catch (error) {
    console.error('Error in getWalletsByUsername:', error);
    throw new Error('Database query failed');
  }
}

// API route handler to get wallets by username
export async function POST(req) {
  try {
    const { username } = await req.json(); // Extract username from the request body

    if (!username) {
      return new Response(
        JSON.stringify({ error: 'Username is required' }),
        { status: 400 }
      );
    }

    const wallets = await getWalletsByUsername(username);

    return new Response(
      JSON.stringify({ username, wallets }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/wallets:', error);

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}