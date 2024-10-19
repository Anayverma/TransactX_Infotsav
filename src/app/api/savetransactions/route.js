"use client";
import React, { useState } from 'react';
import { ethers } from 'ethers';

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
      const response = await fetch('/api/savetransaction', {
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
    <div>
      <button className="enableEthereumButton" onClick={getAccount}>
        Connect MetaMask
      </button>

      <h2>Send Ethereum</h2>
      <div>
        <label>
          UPI ID (Email):
          <input
            type="text"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="Enter UPI ID"
          />
        </label>
        <button onClick={fetchRecipientWallet}>Fetch Recipient Wallet</button>
      </div>
      <div>
        <label>
          Recipient Address:
          <input
            type="text"
            value={recipient}
            readOnly // Make this read-only since it will be fetched
          />
        </label>
      </div>
      <div>
        <label>
          Amount (ETH):
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </label>
      </div>
      <button className="sendEthButton" onClick={sendEth}>
        Send Ethereum
      </button>
    </div>
  );
};

export default SendEth;