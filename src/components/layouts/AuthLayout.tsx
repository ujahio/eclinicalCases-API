import Image from "next/image";
import React, { Suspense } from "react";
import Logo from "@/assets/images/logo.png";

const AuthLayout = ({
  children,
  title,
}: Readonly<{
  children: React.ReactNode;
  title: string;
}>) => {
  return (
    <Suspense fallback={null}>
      <div className="min-h-screen grid place-items-center py-12.5">
        <div className="w-11/12 max-w-200 bg-white py-10 px-6 sm:p-10 md:p-12.5 border border-grey-border rounded-sm">
          <figure className="h-5 sm:h-6">
            <Image src={Logo} alt="E Clinic Logo" className="h-full w-auto" />
          </figure>

          <div className="mt-8">
            <h4 className="text-lg font-medium text-dark">{title}</h4>
            {children}
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default AuthLayout;
