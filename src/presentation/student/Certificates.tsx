import React, { useState } from "react";
import CertificateImg from "@/assets/images/certificate.png";
import Modal from "@/components/ui/Modal";
import DashboardLayout from "@/components/layouts/dashboard";
import { SearchBar } from "@/components/form-elements";
import Image from "next/image";

const Certificates = () => {
  const [showCertModal, setShowCertModal] = useState(false);

  const certPopUp = () => {
    setShowCertModal(true);
  };

  return (
    <DashboardLayout>
      <SearchBar placeholder="Search for certificates" />
      <div className="mt-7.5">
        <ul className="grid grid-cols-items gap-5 md:gap-6.25">
          {[...Array(6)].map((_, index) => (
            <li className="w-full flex flex-col md:max-w-md cursor-pointer" key={index}>
              <button className=" focus:outline-none" onClick={certPopUp}>
                <figure className="w-full mb-2.5">
                  <Image src={CertificateImg} alt="Certificate image" className="w-full" />
                </figure>
              </button>
              <h6 className="text-dark font-medium text-1sm sm:text-base">Malaria</h6>
              <span className="text-grey-300 text-sm">12 Dec, 2020</span>
            </li>
          ))}
        </ul>
      </div>
      <Modal show={showCertModal} toggle={setShowCertModal} size="lg">
        <figure className="py-2">
          <Image src={CertificateImg} alt="" />
        </figure>
      </Modal>
    </DashboardLayout>
  );
};

export default Certificates;
