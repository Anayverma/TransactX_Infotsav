import { Pool } from 'pg';
import { NextResponse } from 'next/server';

// Create a connection pool to the PostgreSQL database
const pool = new Pool({
  connectionString: process.env.NEXT_PUBLIC_DATABASE_URL, // Ensure this is set in your .env file
  ssl: {
    rejectUnauthorized: false, // For development
  },
});

// Ensure the 'defaultwallet' table exists
async function ensureDefaultWalletTable() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS defaultwallet (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        default_wallet VARCHAR(255) NOT NULL
      );
    `;
    await pool.query(query);
  } catch (error) {
    console.error('Error ensuring defaultwallet table:', error);
    throw new Error('Failed to ensure defaultwallet table');
  }
}

// API handler for POST requests
export async function POST(req) {
  try {
    // Parse the incoming request body
    const { username, defaultWallet } = await req.json();

    if (!username || !defaultWallet) {
      return NextResponse.json({ message: 'Missing username or defaultWallet' }, { status: 400 });
    }

    // Ensure the 'defaultwallet' table exists
    await ensureDefaultWalletTable();

    // Check if the user already has a default wallet set
    const findUserQuery = 'SELECT * FROM defaultwallet WHERE email = $1';
    const findUserRes = await pool.query(findUserQuery, [username]);

    if (findUserRes.rows.length > 0) {
      // User already has a default wallet, update it
      const updateQuery = 'UPDATE defaultwallet SET default_wallet = $1 WHERE email = $2';
      await pool.query(updateQuery, [defaultWallet, username]);
      return NextResponse.json({ message: 'Default wallet updated successfully' });
    } else {
      // Insert a new default wallet for the user
      const insertQuery = 'INSERT INTO defaultwallet (email, default_wallet) VALUES ($1, $2)';
      await pool.query(insertQuery, [username, defaultWallet]);
      return NextResponse.json({ message: 'Default wallet set successfully' });
    }
  } catch (error) {
    console.error('Error in /api/setdefault:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}