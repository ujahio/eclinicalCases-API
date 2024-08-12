import React from "react";
import Button from "@/components/ui/Button";
import FemaleAssistantImg from "@/assets/images/femaleassistant.png";
import MaleDoctorImg from "@/assets/images/maledoctor.png";
import FemaleDoctorImg from "@/assets/images/femaledoctor.png";
import Image from "next/image";

const Header = () => {
  return (
    <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-xxl 3xl:max-w-3xl mx-auto">
      <div className="mt-16 md:mt-28 grid grid-cols-1 sm:grid-cols-2 gap-8 header px-6.25 sm:px-10 md:px-15 lg:px-25">
        <div className="lg:w-10/12 tracking-wider">
          <p className="text-darker font-bold text-3xl leading-snug">Welcome to e-Clinical Cases Solutions</p>
          <p className="mt-8 text-dark leading-5">
            Proin ac quam et lectus vestibulum blandit. Nunc maximus nibh at placerat tincidunt. Nam sem lacus, ornare
            non ante sed, ultricies fringilla massa. Ut congue, elit non tempus elementum, sem risus tincidunt diam,
            vitae sodales diam ipsum vitae purus. Fusce tristique erat nulla, vel viverra mi auctor non. Integer ante{" "}
            <br />
            <br />
            Proin ac quam et lectus vestibulum blandit. Nunc maximus nibh at placerat tincidunt. Nam sem lacus, ornare
            non ante sed, ultricies fringilla massa. Ut congue, elit non tempus elementum, sem risus tincidunt diam,
            vitae sodales diam ipsum vitae purus. Fusce tristique erat nulla, vel viverra mi auctor non. Integer ante{" "}
          </p>
          <Button className="sm:mt-16 mt-8" size="lg">
            GET STARTED
          </Button>
        </div>
        <div className="mt-6 md:mt-0 w-auto header-images">
          <figure className="header-img header-img-1">
            <Image
              src={FemaleAssistantImg}
              alt=""
              className="w-full"
              // className="w-48 sm:w-64 lg:w-64 xl:w-80 sm:ml-auto lg:ml-0 xl:ml-12 sm:mb-2 lg:mb-0"
              // style={{width: '60%'}}
            />
          </figure>
          <figure className="header-img header-img-2">
            <Image
              src={MaleDoctorImg}
              alt=""
              className="w-full"
              // className="w-48 sm:w-64 lg:w-64 xl:w-80 sm:ml-auto lg:ml-0 xl:ml-12 sm:mb-2 lg:mb-0"
              // style={{width: '60%'}}
            />
          </figure>
          <figure className="header-img header-img-3">
            <Image
              src={FemaleDoctorImg}
              alt=""
              className="w-full"
              // className="w-48 sm:w-64 lg:w-64 xl:w-80 sm:ml-auto lg:ml-0 xl:ml-12 sm:mb-2 lg:mb-0"
              // style={{width: '60%'}}
            />
          </figure>
        </div>
      </div>
    </div>
  );
};

export default Header;
