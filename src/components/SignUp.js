"use client";
import React, { useState ,useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";

// Custom hook for managing localStorage
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key) || null;
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState("");
  const [addMoreWallets, setAddMoreWallets] = useState(false);
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [lendMoney, setLendMoney] = useState(false);
  const [token, setToken] = useLocalStorage("token", null);
  const [name, setName] = useLocalStorage("username", null);
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  useEffect(() => {
    console.log(localStorage.getItem("token"))
  }, [token, setToken])
  // Wallet integration logic using Metamask
  
  const handleWalletIntegration = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });

        // Check if the wallet already exists in the state
        const walletExists = wallets.some(
          (wallet) => wallet.account === accounts[0]
        );

        if (!walletExists) {
          // If the wallet doesn't exist, add it
          setWallets((prevWallets) => [
            ...prevWallets,
            { account: accounts[0], chainId },
          ]);
          setAddMoreWallets(true);
          toast.success("Wallet successfully added!");
        } else {
          // If the wallet exists, show a message
          toast.info(
            "This wallet is already added. Please change wallet at metamask and then click on ADD WALLET"
          );
        }
      } catch (error) {
        console.error("Metamask connection failed:", error);
        toast.error("Failed to connect with Metamask.");
      }
    } else {
      toast.error("Metamask not installed.");
    }
  };

  const handleSendOtp = async () => {
    try {
      const response = await fetch("/api/emailverify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "send" }), // Include type as "send"
      });
  
      const data = await response.json();
      if (response.ok) {
        setOtpSent(true);
        toast.success("OTP sent successfully! Check your email.");
      } else {
        toast.error(data.error || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP. Please try again.");
    }
  };
  
  const handleVerifyOtp = async () => {
    try {
      const response = await fetch("/api/emailverify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "verify", otpInput: otp }), // Include type as "verify" and pass otpInput
      });
  
      const data = await response.json();
      if (response.ok) {
        setOtpVerified(true);
        toast.success("OTP verified successfully!");
      } else {
        toast.error(data.error || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Failed to verify OTP. Please try again.");
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form validation: Check if passwords match
    if (password !== rePassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!otpVerified) {
      toast.error("Please verify your OTP before signing up.");
      return;
    }

    console.log(
      username,
      email,
      mobile,
      wallets,
      location,
      lendMoney,
      password
    );

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          mobile,
          wallets,
          location,
          lendMoney,
          password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setName(data.username);
        setToken(data.token);
        console.log(username,token);
        toast.success(`Welcome, ${data.username}!`);
        router.push("/dashboard");
      } else {
        toast.error(data.error || "Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Signup failed. Please try again.");
    }
  };

  const indianStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ];

  return (
    <div className="flex flex-col items-center p-8 max-w-lg mx-auto border border-gray-300 rounded-lg bg-white shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Sign Up</h2>
      <form onSubmit={handleSubmit} className="w-full space-y-6">
        {/* Username */}
        <div>
          <label htmlFor="username" className="block mb-2 text-gray-700">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block mb-2 text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        {/* Mobile */}
        <div>
          <label htmlFor="mobile" className="block mb-2 text-gray-700">
            Mobile Number
          </label>
          <input
            id="mobile"
            type="text"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block mb-2 text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        {/* Re-enter Password */}
        <div>
          <label htmlFor="rePassword" className="block mb-2 text-gray-700">
            Re-enter Password
          </label>
          <input
            id="rePassword"
            type="password"
            value={rePassword}
            onChange={(e) => setRePassword(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        {otpSent ? (
          <div>
            <label htmlFor="otp" className="block mb-2 text-gray-700">
              Enter OTP
            </label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
            <button
              type="button"
              onClick={handleVerifyOtp}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
            >
              Verify OTP
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSendOtp}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Send OTP to Email
          </button>
        )}

        {/* State Selection */}
        <div>
          <label htmlFor="location" className="block mb-2 text-gray-700">
            State (Location)
          </label>
          <select
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="">Select your state</option>
            {indianStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        {/* Wallet Integration */}
        <div>
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
            onClick={handleWalletIntegration}
          >
            Integrate Wallet (Ethereum Sepolia & Polygon Mumbai)
          </button>
          {wallets.length > 0 && (
            <>
              <div className="mt-2 text-gray-600">
                Wallets added: {wallets.length}
              </div>

              {/* Dropdown with wallet addresses */}
              <div>
                <label
                  htmlFor="selectedWallet"
                  className="block mb-2 text-gray-700"
                >
                  Select a Wallet
                </label>
                <select
                  id="selectedWallet"
                  value={selectedWallet}
                  onChange={(e) => setSelectedWallet(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Choose a wallet</option>
                  {wallets.map((wallet, index) => (
                    <option key={index} value={wallet.account}>
                      {wallet.account} (Chain ID: {wallet.chainId})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          {addMoreWallets && (
            <button
              type="button"
              className="mt-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
              onClick={handleWalletIntegration}
            >
              Add More Wallets?
            </button>
          )}
        </div>

        {/* Lend Money */}
        <div className="flex items-center">
          <input
            id="lendMoney"
            type="checkbox"
            checked={lendMoney}
            onChange={() => setLendMoney(!lendMoney)}
            className="mr-2"
          />
          <label htmlFor="lendMoney" className="text-gray-700">
            Lend Money
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Signup;
