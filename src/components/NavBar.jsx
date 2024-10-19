import React, { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import Link from "next/link"; // Import next/link

const NavBar = () => {
  const [nav, setNav] = useState(false);

  const links = [
    {
      id: 1,
      link: "Pay",
      url: "/pay", // New field for routing
    },
    {
      id: 2,
      link: "Lend Money",
      url: "/lender", // New field for routing
    },
    {
      id: 3,
      link: "Dashboard",
      url: "/dashboard", // New field for routing
    },
    {
      id: 4,
      link: "Receive Money",
      url: "/receiver", // New field for routing
    },
    {
      id: 5,
      link: "Notifications",
      url: "/notifications", // New field for routing
    },
  ];

  return (
    <div className="flex relative justify-between items-center w-full h-20 px-6 text-white bg-black fixed z-[10000] ">
      <div className="flex items-center">
        <img 
          className="w-[7rem]  m-4 mt-10 " 
          alt="logo" 
          src="https://i.ibb.co/NrrKF9j/image-removebg-preview.png"
        />
      </div>

      <ul className="hidden md:flex">
        {links.map(({ id, link, url }) => (
          <li
            key={id}
            className="px-4 cursor-pointer capitalize font-medium text-[#718096] hover:scale-105 duration-200 hover:text-white  hover:border-b-2 border-[#0B8AC4] transition-all "
          >
            <Link href={url}> {/* Use href for routing */}
              {link}
            </Link>
          </li>
        ))}
      </ul>

      <div
        onClick={() => setNav(!nav)}
        className="cursor-pointer pr-6 z-10 text-gray-500 md:hidden"
      >
        {nav ? <FaTimes size={30} /> : <FaBars size={30} />}
      </div>

      {nav && (
        <ul className="flex flex-col justify-center items-center absolute top-0 left-0 w-full h-screen bg-gradient-to-b from-black to-gray-800 text-gray-500">
          {links.map(({ id, link, url }) => (
            <li
              key={id}
              className="px-4 cursor-pointer capitalize py-6 text-4xl"
            >
              <Link href={url} onClick={() => setNav(!nav)}> {/* Use href for routing */}
                {link}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NavBar;
