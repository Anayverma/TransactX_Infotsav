import Profile from "@/app/profile/page";
import DefaultLayout from "@/components/DefaultLayout";
import React from "react";

export const metadata = {
  title:
    "Next.js E-commerce Dashboard Page | NextAdmin - Next.js Dashboard Kit",
  description: "This is Next.js Home page for NextAdmin Dashboard Kit",
};

export default function Dashboard() {
  return (
    <>
      <Profile />
    </>
  );
}
