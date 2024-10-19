// lib/jwt.js
import jwt from "jsonwebtoken";
import crypto from 'crypto';

const NEXT_PUBLIC_JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET; // Make sure to set this in your environment variables

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    NEXT_PUBLIC_JWT_SECRET,
    { expiresIn: "1h" } // Adjust the expiration time as needed
  );
}
// import crypto from 'crypto';

export function verifyToken(token, userId) {
  const secret = process.env.NEXT_PUBLIC_SALT; // Ensure this is set in your environment

  // Check if the secret is correctly set
  if (!secret) {
    throw new Error('SALT not set in environment variables.');
  }

  // Generate the hash
  const hash = crypto.createHmac('sha256', secret)
                     .update(userId)
                     .digest('hex');

  console.log("Generated Hash:", hash);
  console.log("Provided Token:", token);
  console.log("User ID:", userId);

  // Verify the token by comparing it with the generated hash
  const trimmedToken = token.substring(1, token.length - 1);
  console.log("Provided Tttoken:", trimmedToken);

  // Verify the token by comparing it with the generated hash
  return trimmedToken === hash;
  // return token === hash;
}

export function verifyTokenLogin(token, userId) {
  const secret = process.env.NEXT_PUBLIC_SALT; // Ensure this is set in your environment

  // Check if the secret is correctly set
  if (!secret) {
    throw new Error('SALT not set in environment variables.');
  }

  // Generate the hash
  const hash = crypto.createHmac('sha256', secret)
                     .update(userId)
                     .digest('hex');

  console.log("Generated Hash:", hash);
  console.log("Provided Token:", token);
  console.log("User ID:", userId);

  // Verify the token by comparing it with the generated hash
  const trimmedToken = token.substring(1, token.length - 1);
  console.log("Provided Tttoken:", trimmedToken);

  // Verify the token by comparing it with the generated hash
  // return trimmedToken === hash;
  return token === hash;
}
