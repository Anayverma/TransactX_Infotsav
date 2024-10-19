"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '../../components/NavBar.jsx';
const Navigation = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [userDetails, setUserDetails] = useState([]);
  const username = localStorage.getItem('username'); // Get current user from localStorage

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications', {
          method: 'POST',
        });
        const data = await response.json();
        setNotifications(data.notifications);
        setUserDetails(data.userDetails);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const parseWallets = (walletString) => {
    try {
      const parsedWallets = JSON.parse(walletString);
      return {
        account: parsedWallets.account || 'Unknown Account',
        chainId: parsedWallets.chainId || 'Unknown Chain ID',
      };
    } catch (error) {
      console.error('Error parsing wallets:', error);
      return { account: 'Invalid Data', chainId: 'Invalid Data' }; // Handle invalid data gracefully
    }
  };

  return (
    <div className='bg-black min-h-[100vh] text-white p-6'>
      <Navbar />
  
      {/* Notifications Section */}
      <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-gray-400 to-black text-center mb-6">
        Notifications
      </h1>
      <div className="bg-black border border-gray-300 rounded-lg shadow-lg max-w-4xl mx-auto mb-10 text-gray-400 text-sm" style={styles.contentContainer}>
        {notifications.length === 0 ? (
          <p className="text-center">No notifications for you</p>
        ) : (
          <ul className="list-disc list-inside p-4 space-y-2">
            {notifications.map((notification) => (
              <li key={notification.id} className="mb-2">
                {notification.message} - {new Date(notification.created_at).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>
  
      {/* User Details Section */}
      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-gray-400 to-black text-center mb-6">
        User Details
      </h1>
      {userDetails.length === 0 ? (
        <p className="text-center">No user details found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {userDetails.map((user, index) => { // Add index here
            const wallets = parseWallets(user.wallets); // Use the safe parsing function
  
            return (
              <div 
                key={user.username} 
                className="bg-gray-600 p-6 rounded-lg shadow-md"
                onMouseEnter={() => setHoveredIndex(index)} 
                onMouseLeave={() => setHoveredIndex(null)} 
                style={hoveredIndex === index ? styles.glowEffect : {}}
              >
                <h4 className="text-2xl font-bold mb-2">{user.username}</h4>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Mobile:</strong> {user.mobile}</p>
                <p><strong>Location:</strong> {user.location}</p>
                <p><strong>Wallets:</strong> {wallets.account}</p> {/* Show parsed wallet info */}
                <p><strong>Chain ID:</strong> {wallets.chainId}</p>
                <p><strong>Lend Money:</strong> {user.lendMoney ? 'Yes' : 'No'}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
  
  
};

// Inline styles for the card (you can move this to CSS if preferred)
const cardStyle = {
  border: '1px solid #ccc',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
  backgroundColor: 'black',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
};

export default Navigation;

const styles = {
  glowEffect: {
    boxShadow: '0 4px 15px rgba(255, 255, 255, 0.9)', /* Blue glow */
  },
};