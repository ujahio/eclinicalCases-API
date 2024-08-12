import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      body: ["Nunito", "Roboto", "sans-serif"],
    },
    extend: {
      fontSize: {
        "1xs": "0.8125rem",
        xxs: "0.7rem",
        "1sm": "0.9375rem",
      },
      borderRadius: {
        sm: "0.1875rem",
        md: "0.3125rem",
        xs: "0.04rem",
      },
      margin: {
        0.625: "0.625rem",
      },
      borderWidth: {
        // '0.375': '0.09375rem',
        0.375: "0.09375rem",
      },
      spacing: {
        0.375: "0.09375rem",
        1.25: "0.3125rem",
        3.75: "0.9375rem",
        6.25: "1.5625rem",
        7.5: "1.875rem",
        8.75: "2.1875rem",
        11.25: "2.8125rem",
        12.5: "3.125rem",
        15: "3.75rem",
        17.5: "4.375rem",
        22.5: "5.625rem",
        25: "6.25rem",
        30: "7.5rem",
        "1/10": "10%",
      },
      colors: {
        dark: "#394A5D",
        darker: " #0A131D",
        red: "#DE3253",
        orange: "#DE6E32",
        blue: "#327BDE",
        lightBlue: "#32adde",
        grey: {
          bg: "#FAFCFF",
          border: "#E7EBEF",
          200: "#B8C4D1",
          300: "#8B98A7",
          400: "#DBDBDB",
        },
        neutral: {
          200: "#F5F7FA",
        },
        primary: {
          50: "#CCFAEF",
          100: "#EFF7F9",
          300: "#32DEB5",
        },
      },
      boxShadow: {
        "primary-btn": "5px 5px 20px rgba(0,167,127,0.2)",
        "drop-down": "2px 8px 24px #8B98A726",
      },
      gridTemplateColumns: {
        items: "repeat(auto-fit, minmax(280px, 1fr))",
      },
      minWidth: {
        62.5: "15.625rem",
      },
      maxWidth: {
        120: "30rem",
        150: "37.5rem",
        200: "50.75rem",
        225: "56.25rem",
        xs: "90%",
        sm: "540px",
        md: "720px",
        lg: "960px",
        xl: "1140px",
        xxl: "1440px",
        "3xl": "1640px",
      },
      width: {
        0.8: "0.2rem",
        88: "21rem",
        "45%": "45%",
      },
      height: {
        0.8: "0.19rem",
        28.5: "7.125rem",
      },
      inset: {
        "1/6": "17%",
      },
      screens: {
        "3xl": "1840px",
      },
    },
  },
  plugins: [],
};
export default config;
