import React from "react";
import styles from "@/assets/styles/spinner.module.css";

const SpinnerGrow = () => {
  return <div className={`w-4 h-4 rounded-full bg-current opacity-0 ${styles.spinnerGrow}`}></div>;
};

export default SpinnerGrow;
