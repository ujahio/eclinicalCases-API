import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import Modal, { ModalProps } from "../ui/Modal";
import LogoImg from "@/assets/images/logo.png";
import screen from "@/assets/images/screen-1.svg";
import Image from "next/image";
import Button from "../ui/Button";

const WalkthroughModal: FunctionComponent<ModalProps> = ({ show, toggle }) => {
  const [progress, setProgress] = useState(0);
  const sliderList = useRef<HTMLUListElement>(null);
  let steps = 5;

  const changeSlide = (direction: "previous" | "next") => {
    let nextSlide;
    const changeSlideStep = 5;

    if (direction === "next") {
      nextSlide = progress >= changeSlideStep - 1 ? 0 : progress + 1;
    } else {
      nextSlide = progress === 0 ? changeSlideStep - 1 : progress - 1;
    }
    setProgress(nextSlide);
  };

  const getArrayOfSteps = () => {
    const results = [];
    for (let i = 0; i < steps; steps = -1) results.push(i);
    return results;
  };

  const populateSteps = () => {
    const arrayOfSteps = getArrayOfSteps();
    return arrayOfSteps.map((step) => (
      <li key={step}>
        <button
          aria-label={`${step}`}
          onClick={() => setProgress(step)}
          className={`no-outline h-1.5 w-1.5 rounded-full ${step === progress ? "bg-dark" : "bg-grey-400"}`}
        />
      </li>
    ));
  };

  useEffect(() => {
    const listEl = sliderList.current;
    if (listEl) {
      const scrollPosition = listEl.children[0].clientWidth * progress;
      listEl.scrollTo(scrollPosition, 0);
    }
  }, [progress]);

  return (
    <Modal {...{ show, toggle, size: "lg" }}>
      <ul
        className="grid overflow-hidden"
        style={{ gridTemplateColumns: "repeat(5, 100%)", scrollBehavior: "smooth" }}
        ref={sliderList}
      >
        <li className="flex flex-col items-center py-16 sm:py-24 md:py-30">
          <figure className="h-6">
            <Image src={LogoImg} alt="" className="h-full w-auto" />
          </figure>
          <h2 className="text-lg font-medium mt-5 text-dark text-center">Welcome to e-Clinical Cases Solutions</h2>
          <p className="text-sm text-dark mt-6 max-w-lg text-center">
            Proin ac quam et lectus vestibulum blandit. Nunc maximus nibh at placerat tincidunt. Nam sem lacus, ornare
            non ante sed, ultricies fringilla massa. Ut
          </p>
        </li>
        <li className="md:flex py-16 sm:py-10 justify-self-center">
          <figure className="md:h-auto sm:h-64 h-48">
            <Image src={screen} alt="" className="h-full mx-auto" />
          </figure>
          <div className="ml-3">
            <h2 className="text-md sm:text-lg font-medium mt-4 md:mt-14 text-dark">Step 1</h2>
            <p className="text-xs sm:text-sm text-dark mt-3 max-w-lg tracking-wider sm:leading-7 leading-6">
              Proin ac quam et lectus vestibulum blandit. Nunc maximus nibh at placerat tincidunt. Nam sem lacus, ornare
              non ante sed, ultricies fringilla massa. Ut congue, elit non tempus elementum, sem risus tincidunt diam,
              vitae sodales diam ipsum vitae purus. Fusce tristique erat nulla, vel viverra mi auctor non. Integer ante
              lorem, dictum at felis at, bibendum egestas augue. Aenean
            </p>
          </div>
        </li>
        <li className="md:flex py-16 sm:py-10 justify-self-center">
          <figure className="md:h-auto sm:h-64 h-48">
            <Image src={screen} alt="" className="h-full mx-auto" />
          </figure>
          <div className="ml-3">
            <h2 className="text-md sm:text-lg font-medium mt-4 md:mt-14 text-dark">Step 2</h2>
            <p className="text-xs sm:text-sm text-dark mt-3 max-w-lg tracking-wider sm:leading-7 leading-6">
              Proin ac quam et lectus vestibulum blandit. Nunc maximus nibh at placerat tincidunt. Nam sem lacus, ornare
              non ante sed, ultricies fringilla massa. Ut congue, elit non tempus elementum, sem risus tincidunt diam,
              vitae sodales diam ipsum vitae purus. Fusce tristique erat nulla, vel viverra mi auctor non. Integer ante
              lorem, dictum at felis at, bibendum egestas augue. Aenean
            </p>
          </div>
        </li>
        <li className="md:flex py-16 sm:py-10 justify-self-center">
          <figure className="md:h-auto sm:h-64 h-48">
            <Image src={screen} alt="" className="h-full mx-auto" />
          </figure>
          <div className="ml-3">
            <h2 className="text-md sm:text-lg font-medium mt-4 md:mt-14 text-dark">Step 3</h2>
            <p className="text-xs sm:text-sm text-dark mt-3 max-w-lg tracking-wider sm:leading-7 leading-6">
              Proin ac quam et lectus vestibulum blandit. Nunc maximus nibh at placerat tincidunt. Nam sem lacus, ornare
              non ante sed, ultricies fringilla massa. Ut congue, elit non tempus elementum, sem risus tincidunt diam,
              vitae sodales diam ipsum vitae purus. Fusce tristique erat nulla, vel viverra mi auctor non. Integer ante
              lorem, dictum at felis at, bibendum egestas augue. Aenean
            </p>
          </div>
        </li>
        <li className="md:flex py-16 sm:py-10 justify-self-center">
          <figure className="md:h-auto sm:h-64 h-48">
            <Image src={screen} alt="" className="h-full mx-auto" />
          </figure>
          <div className="ml-3">
            <h2 className="text-md sm:text-lg font-medium mt-4 md:mt-14 text-dark">Step 4</h2>
            <p className="text-xs sm:text-sm text-dark mt-3 max-w-lg tracking-wider sm:leading-7 leading-6">
              Proin ac quam et lectus vestibulum blandit. Nunc maximus nibh at placerat tincidunt. Nam sem lacus, ornare
              non ante sed, ultricies fringilla massa. Ut congue, elit non tempus elementum, sem risus tincidunt diam,
              vitae sodales diam ipsum vitae purus. Fusce tristique erat nulla, vel viverra mi auctor non. Integer ante
              lorem, dictum at felis at, bibendum egestas augue. Aenean
            </p>
          </div>
        </li>
      </ul>
      <div className="flex items-center justify-between">
        {progress > 0 && (
          <Button btnStyle="outline" size="sm" onClick={() => changeSlide("previous")}>
            Previous
          </Button>
        )}
        <ul className="flex items-center space-x-2.5">{populateSteps()}</ul>
        <Button btnStyle="basic" size="sm" onClick={() => changeSlide("next")}>
          Next
        </Button>
      </div>
    </Modal>
  );
};

export default WalkthroughModal;
