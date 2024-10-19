"use client"

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
    const [navbarOpen, setNavbarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    if (!mounted) return null;

    const handleSignOut = () => {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        router.push("/login");
    };

    return (
        <header className="sticky top-0 w-full z-50 backdrop-blur-sm bg-opacity-60 bg-white mb-16">
            <div className="flex flex-col flex-wrap max-w-5xl p-2.5 mx-auto md:flex-row">
                <div className="flex flex-row items-center justify-between p-2 md:p-1">
                    <Link href="/" className="mb-4 text-2xl font-bold text-black transition duration-300 hover:text-gray-300 md:mb-0">
                        UPI 2.0
                    </Link>
                    <button
                        className="px-3 py-1 pb-4 ml-auto text-black outline-none dark:text-gray-300 md:hidden"
                        type="button"
                        aria-label="button"
                        onClick={() => setNavbarOpen(!navbarOpen)}
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-6 h-6"
                        >
                            <line x1="3" y1="6" y2="6" x2="21"></line>
                            <line x1="3" y1="12" y2="12" x2="21"></line>
                            <line x1="3" y1="18" y2="18" x2="21"></line>
                        </svg>
                    </button>
                </div>
                <div
                    className={`md:flex flex-grow items-center ${navbarOpen ? "flex" : "hidden"}`}
                >
                    <div
                        className={
                            "md:flex flex-grow items-center" +
                            (navbarOpen ? " flex" : " hidden")
                        }
                    >
                        <div className="flex flex-wrap items-center justify-center pt-1 pl-2 ml-1 space-x-8 md:space-x-16 md:mx-auto md:pl-14">
                            <Link href="/mask" className="text-black transition duration-300">
                                Payment
                            </Link>
                            <Link href="/demask" className="text-black transition duration-300">
                                Recieve
                            </Link>
                            <Link href="/validate" className="text-black transition duration-300">
                                Exchange Cash
                            </Link>
                            <Link href="/dashboard" className="text-black transition duration-300">
                                History
                            </Link>
                        </div>
                    </div>
                    {isAuthenticated ? (
                        <button
                            className="invisible md:visible px-3 py-1.5 transition-colors hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black bg-black dark:bg-white rounded"
                            onClick={handleSignOut}
                        >
                            Sign Out
                        </button>
                    ) : (
                        <Link
                            href="/login"
                            rel="noopener noreferrer"
                            target="_blank"
                            className="invisible md:visible px-3 py-1.5 transition-colors hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black bg-black dark:bg-white rounded"
                        >
                            Sign up
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}