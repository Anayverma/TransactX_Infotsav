import { Pool } from 'pg';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.NEXT_PUBLIC_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function POST(req) {
  const { upiId } = await req.json();

  if (!upiId) {
    return new Response(JSON.stringify({ message: 'UPI ID is required' }), { status: 400 });
  }

  try {
    // Query the PostgreSQL database for the wallet address linked to the UPI ID (email)
    const { rows } = await pool.query('SELECT default_wallet FROM defaultwallet WHERE email = $1', [upiId]);

    if (rows.length > 0 && rows[0].default_wallet) {
      return new Response(JSON.stringify({ recipientWallet: rows[0].default_wallet }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ message: 'Wallet not found for the provided UPI ID' }), { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return new Response(JSON.stringify({ message: 'Server error' }), { status: 500 });
  }
}