import React, { FunctionComponent } from "react";

export interface TextAreaInterface
  extends React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement> {
  label: string;
  name: string;
  children?: any;
}

const TextArea: FunctionComponent<TextAreaInterface> = ({ label, name, className = "", children, ...props }) => {
  return (
    <div className={`flex flex-col first:mt-0 mt-5 w-full ${className}`}>
      {label !== "" && (
        <label htmlFor={name} className="text-grey-300 text-1sm capitalize font-normal mb-1.5 inline-block">
          {label}
        </label>
      )}
      <textarea
        {...props}
        className="rounded-sm h-full w-full border border-grey-border outline-none focus:outline-none placeholder-grey-200 text-1sm text-dark focus:placeholder-opacity-70 transition-all duration-100 focus:border-primary-300 px-3.75 sm:px-4 py-4"
        style={{ minHeight: 150 }}
        name={name}
        id={name}
      />
    </div>
  );
};

export default TextArea;
