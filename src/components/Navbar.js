"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if the token is present in localStorage
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSignOut = () => {
    // Remove the token from localStorage
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    router.push("/login");
  };

  return (
<div className="bg-[#1b263b] h-[10vh] w-[95%] text-white flex flex-row justify-between items-center m-[2%] rounded-lg">

      <div className="mx-9">
        <Link href="/">UPI 2.0</Link>
      </div>
      <div className="mx-9">
        <Link
          href="/dashboard"
          className="text-black transition duration-300 dark:text-gray-300 hover:text-gray-300 mx-5"
        >
          Exchange cash
        </Link>
        <Link
          href="/pay"
          className="text-black transition duration-300 dark:text-gray-300 hover:text-gray-300 mx-5"
        >
          Receiver
        </Link>
        <Link
          href="/receiver"
          className="text-black transition duration-300 dark:text-gray-300 hover:text-gray-300 mx-5"
        >
          Lend Money 
        </Link>
        <Link
          href="/validate"
          className="text-black transition duration-300 dark:text-gray-300 hover:text-gray-300 mx-5 "
        >
          Exchange cash
        </Link>
      </div>
      <span className="mx-9">
        {isAuthenticated ? (
          <button onClick={handleSignOut}>Sign Out</button>
        ) : (
          <Link href="/login">Signup</Link>
        )}
      </span>
    </div>
  );
};

export default Navbar;
