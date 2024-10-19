"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Corrected import
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { verifyToken, verifyTokenLogin } from "@/lib/jwt";
import DefaultLayout from "@/components/DefaultLayout";

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

const Profile = () => {
  const [username, setUsername] = useState("");
  const [wallets, setWallets] = useState([]);
  const [defaultWallet, setDefaultWallet] = useState("");
  const [addMoreWallets, setAddMoreWallets] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null); // Added state for hovered index
  const [def, setDef] = useLocalStorage("default_wallet", "");
  const [defC, setDefC] = useLocalStorage("default_chain", "");
  const router = useRouter();

  // Fetch token and username from localStorage, and validate token
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");

    if (!token) {
      toast.error("You must be logged in to access this page.");
      router.push("/login"); // Added redirect to login page
      return;
    }

    const user =
      verifyToken(token, storedUsername) || verifyTokenLogin(token, storedUsername);
    if (user) {
      setUsername(storedUsername.replace(/^"(.*)"$/, "$1").trim());
    } else {
      toast.error("Invalid token. Please log in again.");
      router.push("/login"); // Added redirect to login page
    }
  }, [router]);

  // Fetch wallets from localStorage
  useEffect(() => {
    const storedWallets = JSON.parse(localStorage.getItem("wallet")) || [];
    setWallets(storedWallets);
  }, []);

  // Handle wallet integration with MetaMask
  const handleWalletIntegration = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });

        const walletExists = wallets.some(
          (wallet) => wallet.account === accounts[0]
        );

        if (!walletExists) {
          const newWallets = [...wallets, { account: accounts[0], chainId }];
          setWallets(newWallets);
          setAddMoreWallets(true);
          localStorage.setItem("wallet", JSON.stringify(newWallets));
          toast.success("Wallet successfully added!");
        } else {
          toast.info("This wallet is already added.");
        }
      } catch (error) {
        console.error("Metamask connection failed:", error);
        toast.error("Failed to connect with MetaMask.");
      }
    } else {
      toast.error("MetaMask not installed.");
    }
  };

  // Handle the selection of default wallet and send it to the backend
  const handleSetDefault = async () => {
    try {
      const response = await fetch("/api/setdefault", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          defaultWallet,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setDef(defaultWallet);
        toast.success("Default wallet set successfully!");
      } else {
        toast.error(data.message || "Error setting default wallet");
      }
    } catch (error) {
      toast.error("Error setting default wallet");
      console.error("Error setting default wallet:", error);
    }
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto p-6 sm:p-8 md:p-10 lg:p-12">
        <div className="max-w-xl mx-auto bg-white border border-gray-300 rounded-lg shadow-lg p-6 sm:p-8">
          <h2 className="text-2xl font-semibold mb-4 text-center text-gray-900">
            Dashboard
          </h2>
          {username ? (
            <>
              <div className="mb-6 text-center">
                <p className="text-lg text-gray-700">Welcome back, {username}!</p>
                <p className="text-lg text-gray-700">
                  Your UPI ID: {username}@IND
                </p>
              </div>
              {wallets.length > 0 ? (
                <div className="mt-4">
                  <h4 className="text-lg text-gray-800 mb-2">
                    Your Wallets
                  </h4>
                  <select
                    value={defaultWallet}
                    onChange={(e) => setDefaultWallet(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">--Select Default Wallet--</option>
                    {wallets.map((wallet, index) => (
                      <option key={index} value={wallet.account}>
                        {wallet.account} (Chain ID: {wallet.chainId})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleSetDefault}
                    className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  >
                    Set Default Wallet
                  </button>
                  <button
                    onClick={handleWalletIntegration}
                    className="mt-4 w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                  >
                    Add Wallet
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-lg text-gray-700">No wallets found.</p>
                  <button
                    onClick={handleWalletIntegration}
                    className="mt-4 w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                  >
                    Add Wallet
                  </button>
                </>
              )}
            </>
          ) : (
            <p className="text-lg text-gray-700 text-center">Loading...</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 mt-6 border-t border-gray-300">
        {[
          {
            title: "Pay Money",
            description: "Pay Money from your account",
            staticImg: "https://i.ibb.co/NNt7D5p/Screenshot-2024-10-18-181917.png",
            gifSrc: "https://media.tenor.com/lE5QV8hqwNsAAAAi/bunny.gif"
          },
          {
            title: "Receive money",
            description: "Receive money from other users",
            staticImg: "https://via.placeholder.com/150",
            gifSrc: "https://media.tenor.com/T9nttMn6GZQAAAAi/wheres-my-money-where-is-my-money.gif"
          },
          {
            title: "Exchange with Cash",
            description: "Get cash and pay online later",
            staticImg: "https://i.ibb.co/ZKMJJTk/Screenshot-2024-10-18-182256.png",
            gifSrc: "https://media.tenor.com/RN44UiLCcsYAAAAi/dollar-dollars.gif"
          },
          {
            title: "History",
            description: "Details of your past transactions",
            staticImg: "https://i.ibb.co/4s4s29n/Screenshot-2024-10-18-183025.png",
            gifSrc: "https://media.tenor.com/OZRgS-hByvEAAAAi/weve-made-history-stan-marsh.gif"
          }
        ].map((box, index) => (
          <div 
            key={index} 
            className={`flex items-center justify-between p-6 sm:p-8 md:p-10 lg:p-12 border border-gray-300 rounded-lg bg-white shadow-md transition-shadow duration-300 ${hoveredIndex === index ? 'shadow-lg glow-effect' : ''}`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="flex flex-col text-left flex-grow">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">{box.title}</h2>
              <p className="text-lg text-gray-700">{box.description}</p>
            </div>
            <div className="gif-container relative w-24 h-24 ml-4"> {/* Increased size */}
              <img 
                src={box.staticImg} 
                alt="Static Image" 
                className={`static-img absolute top-0 left-0 w-full h-full ${hoveredIndex === index ? 'opacity-0' : 'opacity-100'}`} 
              />
              <img 
                src={box.gifSrc} 
                alt="GIF" 
                className={`gif absolute top-0 left-0 w-full h-full ${hoveredIndex === index ? 'opacity-100' : 'opacity-0'}`} 
              />
            </div>
          </div>
        ))}
      </div>
    </DefaultLayout>
  );
};

export default Profile;
