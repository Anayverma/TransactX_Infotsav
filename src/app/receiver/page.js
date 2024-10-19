"use client";
import React, { useState, useEffect } from 'react';
import NavBar from '../../components/NavBar.jsx'; // Import Navbar
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'; // Leaflet components
import 'leaflet/dist/leaflet.css'; // Leaflet's CSS
import L from 'leaflet'; // Leaflet core

// Custom icon for the marker (optional)
const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});

const ReceiverPage = () => {
  const [receiverUpiId, setReceiverUpiId] = useState('');
  const [receiverAmount, setReceiverAmount] = useState('');
  const [receiverLocation, setReceiverLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [nearbyUpiIds, setNearbyUpiIds] = useState([]);
  const [error, setError] = useState(''); // For error messages

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
        (error) => setError('Failed to get location: ' + error.message),
        { enableHighAccuracy: true }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  // Store receiver data and send to backend
  const handleReceiverSubmit = async () => {
    if (!receiverLocation || !receiverAmount || !receiverUpiId) {
      setError('Please fill in all fields and fetch the location.');
      return;
    }

    if (isNaN(receiverAmount) || Number(receiverAmount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    setLoading(true);
    const receiverData = {
      latitude: receiverLocation.latitude,
      longitude: receiverLocation.longitude,
      upiId: receiverUpiId,
      username: username,
      upiIds: nearbyUpiIds.map(user => user.upi_id)
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
      setNearbyUpiIds(data.nearbyUsers);
      setError(''); // Clear any previous error
    } catch (error) {
      console.error('Error submitting data:', error);
      setError('An error occurred while saving data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <NavBar /> {/* Add the Navbar here */}
      <div style={styles.contentContainer}>
        {/* Left side: Form */}
        <div style={styles.formContainer}>
          <h2 style={styles.header}>Receiver</h2>
          <h2 style={styles.header}>Section</h2>
          {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error messages */}
          <input
            type="text"
            placeholder="Enter UPI ID"
            value={receiverUpiId}
            onChange={(e) => setReceiverUpiId(e.target.value)}
            style={{
              ...styles.input,
              backgroundColor: '#2c2c2c', // Dark background color
              color: '#ffffff', // Light text color for contrast
            }}
          />
          <input
            type="number"
            placeholder="Enter Amount"
            value={receiverAmount}
            onChange={(e) => setReceiverAmount(e.target.value)}
            style={{
              ...styles.input,
              backgroundColor: '#2c2c2c', // Dark background color
              color: '#ffffff', // Light text color for contrast
            }}
          />
          {receiverLocation && (
            <p className='text-white' style={styles.locationText}>
              Location: Latitude {receiverLocation.latitude}, Longitude {receiverLocation.longitude}
            </p>
          )}
          <div style={styles.buttonContainer}>
            <button onClick={getLocation} style={styles.button}>
              Get Location
            </button>
            <button onClick={handleReceiverSubmit} disabled={loading} style={styles.button}>
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>

        {/* Vertical Line */}
        <div className="w-px bg-gray-600 mx-4" style={{ height: '60vh', margin: 'auto auto' }}></div> {/* Vertical line with padding */}

        {/* Right side: Map */}
        <div style={styles.mapContainer} className="rounded-lg">
          <MapContainer
            center={[20.5937, 78.9629]} // Default center for the map
            zoom={13}
            style={{ height: '100%', borderRadius: '15px' }} // Ensure the map takes full height
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {receiverLocation && (
              <Marker position={[receiverLocation.latitude, receiverLocation.longitude]} icon={icon}>
                <Popup>
                  Your Location: Latitude {receiverLocation.latitude}, Longitude {receiverLocation.longitude}
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    backgroundColor: 'Black',
    minHeight: '100vh',
    padding: '20px',
  },
  contentContainer: {
    display: 'flex',
    justifyContent: 'center',
    minHeight: '40vh',
    padding: '20px',
    border: '2px solid #718096',
    borderRadius: '2%',
    width: '80%',
    marginLeft: '10%',
    marginTop: '7%',
    boxShadow: '0 4px 15px rgba(255, 255, 255, 0.9)',
  },
  formContainer: {
    flex: 1,
    padding: '20px',
    marginRight: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    marginTop: '60px',
  },
  mapContainer: {
    flex: 1,
    padding: '20px',
    overflow: 'hidden',
    marginTop: '40px',
    minHeight: '80vh',
    borderRadius: '15px', // Curved corners
  },
  header: {
    color: 'white',
    fontSize: '6rem',
    fontWeight: 'bold',
    background: "linear-gradient(to bottom, #8c8c8c, #000000)",
    WebkitBackgroundClip: "text",
    color: "transparent",
    marginLeft: '-20%',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginTop: '5%',
    marginBottom: '5%',
    borderRadius: '4px', // Rounded corners
  },
  locationText: {
    margin: '10px 0',
    color: '#8c8c8c',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#0d1b2a',
    color: '#8c8c8c',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
};

export default ReceiverPage;
