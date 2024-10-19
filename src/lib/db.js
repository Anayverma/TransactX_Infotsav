import { Pool } from 'pg';

// Create a connection pool to the PostgreSQL database
const pool = new Pool({
  connectionString: process.env.NEXT_PUBLIC_DATABASE_URL, // Ensure this is set in your .env file
  ssl: {
    rejectUnauthorized: false, // For local development
  },
});

// Function to ensure the users table exists with the new fields
async function ensureUsersTable() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        mobile VARCHAR(20) UNIQUE NOT NULL,
        wallets TEXT NOT NULL,
        location TEXT NOT NULL,
        lendMoney BOOLEAN NOT NULL,
        password TEXT NOT NULL
      );
    `;
    await pool.query(query);
  } catch (error) {
    console.error('Error in ensureUsersTable:', error);
    throw new Error('Failed to ensure users table');
  }
}

// Function to find a user by email
export async function findUserByEmail(email) {
  try {
    const query = 'SELECT id, username, email, mobile, wallets, location, lendMoney, password FROM users WHERE email = $1;';
    const res = await pool.query(query, [email]);
    console.log(res.rows)
    return res.rows.length > 0 ? res.rows[0] : null;
  } catch (error) {
    console.error('Error in findUserByEmail:', error);
    throw new Error('Database query failed');
  }
}

// Function to create a new user in the database
export async function createUser(username, email, mobile, wallets, location, lendMoney, hashedPassword) {
  try {
    // Ensure the users table exists
    await ensureUsersTable();

    // Insert the new user into the database
    const query = `
      INSERT INTO users (username, email, mobile, wallets, location, lendMoney, password)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, username, email, mobile, wallets, location, lendMoney;
    `;
    const res = await pool.query(query, [username, email, mobile, wallets, location, lendMoney, hashedPassword]);

    if (res.rows.length > 0) {
      return res.rows[0];
    } else {
      throw new Error('User creation failed');
    }
  } catch (error) {
    console.error('Error in createUser:', error);
    throw new Error('Database query failed');
  }
}

// Function to ensure the defaultwallet table exists
async function ensureDefaultWalletTable() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS defaultwallet (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        defaultWallet TEXT NOT NULL
      );
    `;
    await pool.query(query);
  } catch (error) {
    console.error('Error in ensureDefaultWalletTable:', error);
    throw new Error('Failed to ensure defaultwallet table');
  }
}

// Function to set or update the default wallet for a user
export async function setDefaultWallet(email, defaultWallet) {
  try {
    // Ensure the defaultwallet table exists
    await ensureDefaultWalletTable();

    // Upsert the default wallet for the user (insert or update)
    const query = `
      INSERT INTO defaultwallet (email, defaultWallet)
      VALUES ($1, $2)
      ON CONFLICT (email)
      DO UPDATE SET defaultWallet = $2
      RETURNING email, defaultWallet;
    `;
    const res = await pool.query(query, [email, defaultWallet]);

    if (res.rows.length > 0) {
      return res.rows[0];
    } else {
      throw new Error('Failed to set default wallet');
    }
  } catch (error) {
    console.error('Error in setDefaultWallet:', error);
    throw new Error('Database query failed');
  }
}