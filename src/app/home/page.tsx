import React from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import HomeComp from "@/presentation/home";
const page = () => {
  return (
    <div>
      <Navbar />
      <HomeComp />
      <Footer />
    </div>
  );
};

export default page;
