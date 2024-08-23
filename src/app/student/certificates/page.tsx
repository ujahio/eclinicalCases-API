"use client";

import React from "react";
import CertificatesComp from "@/presentation/student/Certificates";
const Certificates = () => {
  return (
    <div>
      <CertificatesComp show={false} toggle={() => {}} />
    </div>
  );
};

export default Certificates;
