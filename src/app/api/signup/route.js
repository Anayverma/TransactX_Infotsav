import { NextResponse } from 'next/server';
import { createUser, findUserByEmail } from '../../../lib/db';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Hash password with SHA-256 using crypto
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

export async function POST(req) {
  try {
    // Parse request body
    const { username, email, mobile, wallets, location, lendMoney, password } = await req.json();

    // Validate inputs
    if (!username || !email || !mobile || !wallets || !location || lendMoney == null || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists.' }, { status: 409 });
    }

    // Hash password
    console.log(password)
    const hashedPassword = hashPassword(password);
    
    // Create user in the database with additional fields
    const user = await createUser(username, email, mobile, wallets, location, lendMoney, hashedPassword);

    function createToken(username) {
      const secret = process.env.NEXT_PUBLIC_SALT; // Ensure this is set in your environment
      const hash = crypto.createHmac('sha256', secret)
                         .update("\""+username+"\"")
                         .digest('hex');

      console.log("main->>",username)
      return hash;
    }

    // Generate JWT token
    const token =createToken(username)
    console.log(username,token)

    // Respond with token and username
    return NextResponse.json({ token, username: username });
  } catch (error) {
    console.error('Error in signup:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
