import { Pool } from 'pg';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.NEXT_PUBLIC_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
export async function POST(req) {
  try {
    const { wallets } = await req.json(); // Extract wallets from request body
    console.log("1111",wallets)
    if (!wallets || wallets.length === 0) {
      return new Response(JSON.stringify({ error: "Wallets are required" }), {
        status: 400,
      });
    }
    console.log("11111",wallets)

    const query = `
      SELECT * FROM transaction_history 
      WHERE sender_address = ANY($1) OR recipient_address = ANY($1)
      ORDER BY timestamp DESC;
    `;
    const result = await pool.query(query, [wallets]);
    console.log("11111",wallets)

    return new Response(JSON.stringify({ transactions: result.rows }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}