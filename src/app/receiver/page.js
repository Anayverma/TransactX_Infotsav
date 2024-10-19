"use client";
import React, { useState, useEffect } from 'react';

const ReceiverPage = () => {
  const [receiverUpiId, setReceiverUpiId] = useState(''); // Receiver's UPI ID
  const [receiverAmount, setReceiverAmount] = useState(''); // Amount for Receiver
  const [receiverLocation, setReceiverLocation] = useState(null); // Receiver's location
  const [loading, setLoading] = useState(false); // Loading state for submission
  const [username, setUsername] = useState(''); // Username
  const [nearbyUpiIds, setNearbyUpiIds] = useState([]); // Store nearby UPI IDs

  // Fetch and set username from localStorage on client-side
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
      setReceiverUpiId(storedUsername); // Optionally set UPI ID to username if needed
    }
  }, []); // Run only on client mount

  // Fetch and store receiver's location
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setReceiverLocation({ latitude, longitude });
        },
        (error) => alert('Failed to get location: ' + error.message),
        { enableHighAccuracy: true }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  // Store receiver data and send to backend
  const handleReceiverSubmit = async () => {
    if (!receiverLocation || !receiverAmount || !receiverUpiId) {
      alert('Please fill in all fields and fetch the location.');
      return;
    }

    setLoading(true); // Set loading state
    const receiverData = {
      latitude: receiverLocation.latitude,
      longitude: receiverLocation.longitude,
      upiId: receiverUpiId,
      username: username,
      upiIds: nearbyUpiIds.map(user => user.upi_id) // Get nearby UPI IDs from state
    };

    try {
      const response = await fetch('/api/loc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(receiverData),
      });

      if (!response.ok) {
        throw new Error('Failed to save location and notifications');
      }

      const data = await response.json();
      alert(`Nearby persons found with UPI IDs: ${data.nearbyUsers.map(user => user.upi_id).join(', ')}`);
      setNearbyUpiIds(data.nearbyUsers); // Update nearby UPI IDs state
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('An error occurred while saving data.');
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Receiver Section</h2>
      <input
        type="text"
        placeholder="Enter UPI ID"
        value={receiverUpiId}
        onChange={(e) => setReceiverUpiId(e.target.value)}
      />
      <input
        type="number"
        placeholder="Enter Amount"
        value={receiverAmount}
        onChange={(e) => setReceiverAmount(e.target.value)}
      />
      {receiverLocation && (
        <p>
          Location: Latitude {receiverLocation.latitude}, Longitude {receiverLocation.longitude}
        </p>
      )}
      <button onClick={getLocation} style={{ marginRight: '10px' }}>
        Get Location
      </button>
      <button onClick={handleReceiverSubmit} disabled={loading}>
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </div>
  );
};

export default ReceiverPage;