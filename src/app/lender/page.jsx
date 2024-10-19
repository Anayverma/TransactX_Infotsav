"use client";
import React, { useState } from 'react';

const LenderPage = () => {
  const [upiId, setUpiId] = useState(localStorage.getItem("username") || ''); // UPI ID for Lender
  const [lenderLocation, setLenderLocation] = useState(null); // Lender's location
  const [loading, setLoading] = useState(false); // Loading state for submission

  // Fetch and store lender's location
  const getLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLenderLocation({ latitude, longitude });
        },
        (error) => alert('Failed to get location: ' + error.message),
        { enableHighAccuracy: true }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  // Submit the data to the backend
  const handleSubmit = async () => {
    if (!lenderLocation || !upiId) {
      alert('Please fetch the location and provide a UPI ID.');
      return;
    }

    setLoading(true); // Set loading state
    try {
      const response = await fetch('/api/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          latitude: lenderLocation.latitude, 
          longitude: lenderLocation.longitude, 
          upiId 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save lender location.');
      }

      alert('Location saved successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while saving the location.');
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Lender Section</h2>
      <input
        type="text"
        placeholder="Enter your UPI ID"
        value={upiId}
        onChange={(e) => setUpiId(e.target.value)}
      />
      {lenderLocation && (
        <p>
          Location: Latitude {lenderLocation.latitude}, Longitude {lenderLocation.longitude}
        </p>
      )}
      <button onClick={getLocation} style={{ marginRight: '10px' }}>
        Get Location
      </button>
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Saving...' : 'Click to Save'}
      </button>
    </div>
  );
};

export default LenderPage;