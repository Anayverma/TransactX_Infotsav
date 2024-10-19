"use client";
import React, { useState, useEffect } from 'react';
import NavBar from '../../components/NavBar.jsx'; // Import Navbar
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'; // Leaflet components
import 'leaflet/dist/leaflet.css'; // Leaflet's CSS
import L from 'leaflet'; // Leaflet core
import 'leaflet/dist/leaflet.css'; // Import Leaflet styles

// Custom icon for the marker (optional)
const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});

const LenderPage = () => {
  const [upiId, setUpiId] = useState(localStorage.getItem("username") || ''); // UPI ID for Lender
  const [lenderLocation, setLenderLocation] = useState(null); // Lender's location
  const [loading, setLoading] = useState(false); // Loading state for submission
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default center (India)

  // Fetch and store lender's location
  const getLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLenderLocation({ latitude, longitude });
          setMapCenter([latitude, longitude]); // Center the map on the user's location
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
    <div style={styles.pageContainer}>
    <NavBar /> {/* Add the Navbar here */}
    <div style={styles.contentContainer}>
      {/* Left side: Form */}
      <div style={styles.formContainer}>
        <h2 style={styles.header}>Lender </h2>
        <h2 style={styles.header}>Section</h2>
        <input
        type="text"
        placeholder="Enter your UPI ID"
        value={upiId}
        onChange={(e) => setUpiId(e.target.value)}
        style={{ 
            ...styles.input, 
            backgroundColor: '#2c2c2c', // Dark background color
            color: '#ffffff', // Light text color for contrast
           
            borderRadius: '4px', // Optional: Rounded corners
            padding: '10px' // Optional: Padding for better usability
        }}
        />
        {lenderLocation && (
          <p className='text-white' style={styles.locationText}>
            Location: Latitude {lenderLocation.latitude}, Longitude {lenderLocation.longitude}
          </p>
        )}
        <div style={styles.buttonContainer}>
          <button onClick={getLocation} style={styles.button}>
            Get Location
          </button>
          <button onClick={handleSubmit} disabled={loading} style={styles.button}>
            {loading ? 'Saving...' : 'Click to Save'}
          </button>
        </div>
      </div>
  
      {/* Vertical Line */}
      <div className="w-px bg-gray-600 mx-4" style={{ height: '60vh', margin: 'auto auto' }}></div> {/* Vertical line with padding */}
  
      {/* Right side: Map */}
      <div
  style={{
    ...styles.mapContainer,
    borderRadius: '15px', // Curved corners
    overflow: 'hidden', // Hide overflow to maintain the curve
  }}
  className="rounded-lg" // Additional Tailwind class if you're using it
>
  <MapContainer
    center={mapCenter}
    zoom={13}
    style={{ 
      height: '100%', // Ensure the map takes full height
      borderRadius: '15px' // Apply border radius to MapContainer if needed
    }}
  >
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    />
    {lenderLocation && (
      <Marker position={[lenderLocation.latitude, lenderLocation.longitude]} icon={icon}>
        <Popup>
          Your Location: Latitude {lenderLocation.latitude}, Longitude {lenderLocation.longitude}
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
    backgroundColor: 'Black', // Set background color for the entire page
    minHeight: '100vh', // Ensure it covers the full viewport height
    padding: '20px'
  },
  contentContainer: {
    display: 'flex',
    justifyContent: 'center', // Divides the page into two parts (form and map)
    minHeight: '40vh',
    padding: '20px',
    border:'2px solid #718096',
    borderRadius:'2%',
    width:'80%',
    marginLeft:'10%',
    marginTop:'7%',
    boxShadow: '0 4px 15px rgba(255, 255, 255, 0.9)', 
  },
  formContainer: {
    flex: 1, // Takes up 50% of the screen
    padding: '20px',
    marginRight: '20px', // Add space between the form and the map
    // backgroundColor: '#778da9',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    marginTop: '60px',
  },
  mapContainer: {
    flex: 1,                     // Takes up available space
    padding: '20px',
    overflow: 'hidden',          // Prevent the map from overflowing
    marginTop: '40px',           // Adjust this value based on your navbar height
    minHeight: '80vh',          // Ensures the container takes at least the full height of the viewport
    borderRadius: '5%',        // Rounds the corners
}, 
  map: {
    width: '100%',
    height: '100%'
  },
  header: {
    color: 'white',
    fontSize:'6rem',fontWeight:'bold',
    background: "linear-gradient(to bottom, #8c8c8c, #000000)",
    WebkitBackgroundClip: "text",
    color: "transparent",
    marginLeft:'-30%'
  },
  input: {
    width: '100%',
    padding: '10px',
    marginTop:'5%',
    marginBottom: '5%',
  },
  locationText: {
    margin: '10px 0',
    color: '#8c8c8c'
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
    transition: 'background-color 0.3s'
  }
};

export default LenderPage;
