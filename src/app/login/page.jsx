"use client";
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/NavBar.jsx'

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('username', data.username);
          localStorage.setItem('wallet', data.wallet);
          localStorage.setItem('default_wallet', data.default_wallet);

        toast.success(`Welcome back, ${data.username}!`);
        router.push('/dashboard');
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    }
  };

  return (
    <div className="bg-black min-h-[100vh] text-white p-6">
        <Navbar></Navbar>
    <div className="flex flex-col items-center p-6 sm:p-8 md:p-10 lg:p-12 max-w-lg mx-auto border border-gray-300 rounded-lg bg-black shadow-md" style={styles.contentContainer}>
    <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-gray-400 to-black text-center mb-6">
        Login
      </h1>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="w-full mb-6">
          <label htmlFor="email" className="block text-gray-400 text-sm mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md bg-[#2c2c2c] text-white"
            required
          />
        </div>
        <div className="w-full mb-6">
          <label htmlFor="password" className="block text-gray-400 text-sm mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md bg-[#2c2c2c] text-white"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full px-6 py-2 text-white font-semibold rounded-lg bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Login
        </button>
      </form>
    </div>
    </div>
  );
};

export default Login;

const styles = {
    contentContainer: {
      
      boxShadow: '0 4px 15px rgba(255, 255, 255, 0.9)', 
    },
  };