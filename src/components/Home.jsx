"use client";
import React from "react";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { useRouter } from "next/navigation"; // Import useRouter
import ParticlesComponent from '../config/particles';
import Checked from "./Checked";
import NavBar from "./NavBar.jsx";

const Home = () => {
  const router = useRouter(); // Initialize useRouter

  const handleSignUpClick = () => {
    router.push("signup"); // Programmatically navigate to #signup section
  };

  return (
    <div name="home" className="h-vh w-full bg-gradient-to-b from-black via-black to-gray-800">
      <NavBar />
      
      <div id="particles">
        <ParticlesComponent />
      </div>
     
      <div className="max-w-vw mx-auto flex flex-col items-center justify-around min-h-[800px] px-4 md:flex-row md:px-7 z-10">
        <div className="flex flex-col justify-center h-full order-2 md:order-1 gap-4 z-10">
          <h3 className="text-4xl sm:text-[55px] text-black shadow-2xl" style={{ textShadow: '0 0 0 #FFFFFF' }}>
            Introducing
          </h3>

          <h3 className="text-4xl sm:text-[55px] font-bold text-white"></h3>
          <Checked />

          <p className="text-gray-500 py-4 max-w-md text-justify">
            🌐 Introducing the new version of the UPI. Forget about traditional methods and revolutionize your world with us.
          </p>

          <div className="z-10">
            <button
              onClick={handleSignUpClick} // Use onClick for navigation
              className="group text-white w-fit px-6 py-3 my-2 flex items-center rounded-md bg-gradient-to-r from-cyan-500 to-blue-500 cursor-pointer"
            >
              Sign Up
              <span className="group-hover:rotate-90 duration-300">
                <MdOutlineKeyboardArrowRight size={25} className="ml-1" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
