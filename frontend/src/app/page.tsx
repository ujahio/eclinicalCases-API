"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import HomeComp from "@/presentation/home";

export default function Home() {
  return (
    <div>
      <Navbar />
      <HomeComp />
      <Footer />
    </div>
  );
}
