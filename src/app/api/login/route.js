import { NextResponse } from "next/server";
import { findUserByEmail } from "../../../lib/db"; // Adjusted the import path to match the signup file
import { findUserByEmailWithWallets } from "../../../lib/db"; // Adjust the import path

import crypto from "crypto";

// Hash password with Keccak-256

const hashPassword = (password) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};
// Generate token with HMAC-SHA256
function createToken(username) {
  const secret = process.env.NEXT_PUBLIC_SALT; // Ensure this is set in your environment

  if (!secret) {
    throw new Error("SALT not set in environment variables.");
  }

  // Wrap the username in quotes before hashing
  const hash = crypto
    .createHmac("sha256", secret)
    .update(username)
    .digest("hex");

  return hash;
}

export async function POST(req) {
  try {
    // Parse request body
    const { email, password } = await req.json();

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // Hash the provided password
    const hashedPassword = hashPassword(password);

    // Retrieve the user by email
    const user = await findUserByEmailWithWallets(email);
    console.log(user.password, "poko");
    // Check if user exists and if the hashed passwords match
    if (!user || user.password !== hashedPassword) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Generate a token using the username
    const token = createToken(user.username);
    console.log("bac",user)
    // Return the token, username, wallets, and default wallet
    return NextResponse.json(
      {
        token,
        username: user.username,
        wallet: user.wallets,
        default_wallet: user.default_wallet,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}