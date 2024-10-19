import { Pool } from 'pg';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.NEXT_PUBLIC_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Function to check and create the transaction_history table if it doesn't exist
const checkAndCreateTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS transaction_history (
      id SERIAL PRIMARY KEY,
      sender_address VARCHAR(42) NOT NULL,
      recipient_address VARCHAR(42) NOT NULL,
      amount NUMERIC NOT NULL,
      timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(createTableQuery);
    console.log("Transaction history table checked/created successfully.");
  } catch (error) {
    console.error("Error creating transaction history table:", error);
  }
};

export async function POST(req) {
  // Ensure the table exists before processing the transaction
  await checkAndCreateTable();

  const { senderAddress, recipientAddress, amount } = await req.json();

  if (!senderAddress || !recipientAddress || !amount) {
    return new Response(JSON.stringify({ message: 'Sender address, recipient address, and amount are required.' }), { status: 400 });
  }

  try {
    // Insert the transaction into the database
    await pool.query(
      'INSERT INTO transaction_history (sender_address, recipient_address, amount) VALUES ($1, $2, $3)',
      [senderAddress, recipientAddress, amount]
    );
    return new Response(JSON.stringify({ message: 'Transaction saved successfully.' }), { status: 200 });
  } catch (error) {
    console.error('Error saving transaction:', error);
    return new Response(JSON.stringify({ message: 'Server error' }), { status: 500 });
  }
}
