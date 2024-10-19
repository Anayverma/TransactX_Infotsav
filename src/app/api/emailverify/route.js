"use server";
import nodemailer from "nodemailer";

// Store OTPs temporarily (for demo purposes, using an in-memory store)
let otpStore = {};

export async function POST(req) {
  const { email, type, otpInput } = await req.json();

  if (!email || !type) {
    return new Response(JSON.stringify({ error: "Email and type are required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Set up transporter for nodemailer
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.NEXT_PUBLIC_EMAIL_USER, // use env vars for sensitive data
      pass: process.env.NEXT_PUBLIC_EMAIL_PASS,
    },
  });

  // Handle OTP generation and sending
  if (type === "send") {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save OTP and timestamp in otpStore (this would be a database in production)
    otpStore[email] = { otp, timestamp: Date.now() };

    // Compose email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif;">
        <h2>Your OTP Code</h2>
        <p>Hello,</p>
        <p>Your OTP for verification is: <strong>${otp}</strong></p>
        <p>This code is valid for 5 minutes.</p>
      </div>
    `;

    try {
      // Send email
      let info = await transporter.sendMail({
        from:` "No-Reply" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your OTP Code",
        html: emailContent,
      });

      console.log("OTP sent: %s", info.messageId);
      return new Response(JSON.stringify({ message: "OTP sent successfully" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error sending OTP:", error);
      return new Response(JSON.stringify({ error: "Error sending OTP" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Handle OTP verification
  if (type === "verify") {
    if (!otpInput) {
      return new Response(JSON.stringify({ error: "OTP is required for verification." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const storedOtpData = otpStore[email];
    
    // Check if OTP exists and hasn't expired (valid for 5 minutes)
    if (!storedOtpData || Date.now() - storedOtpData.timestamp > 5 * 60 * 1000) {
      return new Response(JSON.stringify({ error: "OTP has expired or does not exist." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify OTP
    if (storedOtpData.otp === otpInput) {
      delete otpStore[email]; // Clear OTP after successful verification
      return new Response(JSON.stringify({ message: "OTP verified successfully" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ error: "Invalid OTP." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Return error if type is neither "send" nor "verify"
  return new Response(JSON.stringify({ error: "Invalid request type." }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}