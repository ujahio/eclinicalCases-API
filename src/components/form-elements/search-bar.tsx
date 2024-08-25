import React, { ChangeEvent, FunctionComponent } from "react";
import InputField from "./input-field";

interface SearchBarProps {
  placeholder: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

const SearchBar: FunctionComponent<SearchBarProps> = ({ placeholder, onChange }) => {
  return (
    <InputField label="" {...{ placeholder, onChange }} name="search">
      <button className="no-outline inline-flex items-center justify-center h-8.75 w-8.75 sm:w-10 sm:h-10 p-2.5 sm:p-3 bg-transparent hover:rounded-sm text-dark hover:bg-dark transition-all duration-300 ease-out hover:text-white absolute right-1.25">
        <svg viewBox="0 0 15.012 15.012">
          <g transform="translate(0.75 0.75)">
            <path
              d="M19.234,13.367A5.867,5.867,0,1,1,13.367,7.5,5.867,5.867,0,0,1,19.234,13.367Z"
              transform="translate(-7.5 -7.5)"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.7"
            />
            <path
              d="M44.815,44.815l-3.19-3.19"
              transform="translate(-31.614 -31.614)"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.7"
            />
          </g>
        </svg>
      </button>
    </InputField>
  );
};

export default SearchBar;
