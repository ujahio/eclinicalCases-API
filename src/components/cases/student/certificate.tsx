"use client";
import React, { FunctionComponent } from "react";
import Button from "@/components/ui/Button";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";

interface CertificateProps {
  goNext: () => void;
}

const StudentCertificate: FunctionComponent<CertificateProps> = ({ goNext }) => {
  const submitResponseState = useAppSelector((state) => state.submitCaseResponse.response);
  return (
    <>
      <div className="mb-5 sm:mb-6">
        <figure className="w-full" id="pdfCertificate">
          {/* <Image src={CertificateImg} alt="" className="w-full" /> */}
          <img src={submitResponseState.pngURL} alt="" className="w-full" />
        </figure>
      </div>
      <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
        <Button btnStyle="outline" size="lg" centralize>
          <a href={submitResponseState.pdfURL} target="_blank" rel="noopener noreferrer">
            Download Certificate
          </a>
        </Button>
        <Button btnStyle="basic" size="lg" centralize onClick={() => goNext()}>
          Proceed to feedback
        </Button>
      </div>
    </>
  );
};

export default StudentCertificate;
