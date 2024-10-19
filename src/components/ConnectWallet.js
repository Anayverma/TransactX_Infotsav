"use client";
import React, { useState } from 'react';
import { ethers } from 'ethers';
import Navbar from './NavBar.jsx';

const SendEth = () => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [upiId, setUpiId] = useState(''); // State for UPI ID

  // Connect to MetaMask and get the user's account
  const getAccount = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    if (provider) { 
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccounts(accounts);
        console.log(accounts);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  // Fetch the recipient wallet address using the UPI ID
  const fetchRecipientWallet = async () => {
    try {
      const response = await fetch('/api/getWalletFromUPI', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ upiId }), // Send UPI ID (email) to the API
      });

      const data = await response.json();
      if (response.ok) {
        setRecipient(data.recipientWallet); // Set the recipient to the wallet address returned
      } else {
        console.error('Error fetching recipient wallet:', data.message);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  // Function to send Ethereum and save transaction details
  const sendEth = async () => {
    if (!recipient || !amount) {
      alert("Please enter recipient address and amount.");
      return;
    }

    const amountInWei = ethers.utils.parseUnits(amount, 'ether'); // Convert amount to Wei

    try {
      const add = localStorage.getItem("default_wallet").substring(1, 43); // Get sender address
      console.log(add);

      // Send the Ethereum transaction
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: add,
            to: recipient,
            value: amountInWei._hex,
            gasLimit: '0x5028',
            maxPriorityFeePerGas: '0x3b9aca00',
            maxFeePerGas: '0x2540be400',
          },
        ],
      });
      console.log("Transaction Hash:", txHash);

      // Save the transaction details to the database
      await saveTransaction(add, recipient, amount);
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  // Function to save transaction details to the database
  const saveTransaction = async (senderAddress, recipientAddress, amount) => {
    try {
      const response = await fetch('/api/savetransactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ senderAddress, recipientAddress, amount }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(data.message);
      } else {
        console.error('Error saving transaction:', data.message);
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 sm:p-8 md:p-10 lg:p-12 bg-black relative min-h-screen">
      <Navbar className="absolute top-0 left-0 w-full" />
  
      <div
        className="max-w-xl mx-auto bg-black border border-gray-300 rounded-lg shadow-lg p-6 sm:p-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        style={styles.contentContainer}
      >
        <h2 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-gray-400 to-black text-center mb-6">
          Send Money
        </h2>
  
        <div className="mb-6">
          <label className="block text-gray-400 text-sm mb-2">UPI ID (Email):</label>
          <input
            type="text"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="Enter UPI ID"
            className="w-full p-2 border border-gray-300 rounded-md bg-[#2c2c2c] text-white"
          />
          <button
            className="mt-4 w-full bg-[#0d1b2a] text-white px-4 py-2 rounded-md hover:bg-[#2c2c2c]"
            onClick={fetchRecipientWallet}
          >
            Fetch Recipient Wallet
          </button>
        </div>
  
        <div className="mb-6">
          <label className="block text-gray-400 text-sm mb-2">Recipient Address:</label>
          <input
            type="text"
            value={recipient}
            readOnly
            className="w-full p-2 border border-gray-300 rounded-md bg-[#2c2c2c] text-white"
          />
        </div>
  
        <div className="mb-6">
          <label className="block text-gray-400 text-sm mb-2">Amount (ETH):</label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full p-2 border border-gray-300 rounded-md bg-[#2c2c2c] text-white"
          />
        </div>
  
        <button
          className="w-full bg-[#0d1b2a] text-white px-4 py-2 rounded-md hover:bg-[#2c2c2c]"
          onClick={sendEth}
        >
          Send Money
        </button>
      </div>
    </div>
  );
  
};

export default SendEth;
const styles = {
  contentContainer: {
    
    boxShadow: '0 4px 15px rgba(255, 255, 255, 0.9)', 
  },
};