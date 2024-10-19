import SignUp from '@/components/SignUp';
import React from 'react';
import Link from 'next/link';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import Navbar from '@/components/Navbar';

const Page = () => {
  return (
    <div>
    {/* <Navbar/> */}

      <SignUp /> {/* Original SignUp Component */}

      <div className="text-center mt-4">
        <p>
          Already have an account? 
          <Link href="/login" className="text-blue-500 underline ml-2">
            Login
          </Link>
        </p>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Page;
