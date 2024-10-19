import React from "react";
import Link from "next/link"; // Import Link from Next.js

const Footer = () => {
  const links = [
    { id: 1, link: "/pay", label: "Pay" },
    { id: 2, link: "/lender", label: "Lend Money" },
    { id: 3, link: "/dashboard", label: "Dashboard" },
    { id: 4, link: "/login", label: "Login" }
  ];

  return (
    <div className="flex flex-col items-center w-full bg-black text-white py-4">
      {/* Horizontal line above footer */}
      <hr className="border-t border-gray-700 w-full mb-4" />

      <ul className="flex flex-wrap justify-center">
        {links.map(({ id, link, label }) => (
          <li key={id} className="px-4 cursor-pointer capitalize font-medium text-[#718096] hover:scale-105 duration-200 hover:text-white">
            <Link href={link} passHref>
              {label}
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-gray-400">© 2024 Your TransactX. All rights reserved.</p>
    </div>
  );
};

export default Footer;