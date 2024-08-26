import React, { useState, FunctionComponent } from "react";
import { InputField } from "@/components/form-elements";
import Button from "@/components/ui/Button";

export interface ProfessionalDetailsProps {
  profession: string;
  expertise: string;
  professionalTitle: string;
}

type ProfessionalDetailsFormProps = {
  switchByKey: (key: string) => void;
  handleCaptureProfessionalDetails: (ProfessionalDetails: ProfessionalDetailsProps) => void;
};

const ProfessionalDetailsForm: FunctionComponent<ProfessionalDetailsFormProps> = ({
  switchByKey,
  handleCaptureProfessionalDetails,
}) => {
  const [professionalDetails, setProfessionalDetails] = useState({
    profession: "",
    expertise: "",
    professionalTitle: "",
  });

  const submitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleCaptureProfessionalDetails(professionalDetails);
    switchByKey("review_and_confirm");
  };

  const handleInputChange = (name: string, event: any) => {
    const value = event.target.value;
    setProfessionalDetails({ ...professionalDetails, [name]: value });
  };

  return (
    <form onSubmit={submitForm} className="mt-5">
      <InputField
        label="Name Of Profession"
        name="profession"
        placeholder="Enter Profession"
        onChange={(event) => handleInputChange("profession", event)}
      />

      <InputField
        label="Area Of Expertise"
        name="expertise"
        placeholder="Enter Area Of Expertise"
        onChange={(event) => handleInputChange("expertise", event)}
      />

      <InputField
        label="Professional Title"
        placeholder="Enter Professional Title"
        name="professionalTitle"
        onChange={(event) => handleInputChange("professionalTitle", event)}
      />

      <div className="mt-8">
        <Button block>
          Continue
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            className="transform transition-transform duration-200 ease-in-out group-hover:translate-x-1"
          >
            <path
              d="M3,10H15.173L9.587,4.413,11,3l8,8-8,8L9.587,17.587,15.173,12H3Z"
              transform="translate(-3 -3)"
              fill="currentColor"
            />
          </svg>
        </Button>
      </div>
    </form>
  );
};

export default ProfessionalDetailsForm;
