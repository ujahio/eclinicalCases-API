import { InputField } from "@/components/form-elements";
import Button from "@/components/ui/Button";
import { useAppSelector } from "@/services/hooks/hooks";
import { DoctorMaterialsAndDeadlineProps } from "@/services/types/doctor/createCaseStudy";
import React, { useState, ChangeEvent, useRef } from "react";

const DoctorMaterialsAndDeadline = ({
  goNext,
  caseStudy,
  setCaseStudy,
  handleAddCase,
}: DoctorMaterialsAndDeadlineProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addCaseState = useAppSelector((state) => state.addCase.status);

  const addFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Click the file input to open the dialog
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
    setCaseStudy({ ...caseStudy, caseMaterials: updatedFiles }); // Update caseStudy state
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files && e.target.files[0];
    if (selectedFile) {
      setFiles([...files, selectedFile]);
      setCaseStudy({ ...caseStudy, caseMaterials: [...files, selectedFile] }); // Update caseStudy state
    }
  };

  return (
    <>
      <h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-4">Materials and deadline</h6>
      <div className="mb-5 sm:mb-6">
        <label className="text-grey-300 text-1sm font-normal">Materials for further readings</label>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".doc,.docx,.pdf,.xls,.xlsx,.ppt,.pptx"
          onChange={handleFileChange}
        />
        <ul className="mt-3 space-y-2">
          {caseStudy.caseMaterials.map((file: any, index: number) => (
            <li
              key={file.name}
              className="flex items-center justify-between px-5 py-2 border-grey-border bg-white border text-1xs sm:text-sm"
            >
              <div className="inline-flex items-center">
                <svg height="16" viewBox="0 0 11 22" className="mr-4 text-grey-300">
                  <path
                    d="M16.5,6V17.5a4,4,0,0,1-8,0V5a2.5,2.5,0,0,1,5,0V15.5a1,1,0,0,1-2,0V6H10v9.5a2.5,2.5,0,0,0,5,0V5A4,4,0,0,0,7,5V17.5a5.5,5.5,0,0,0,11,0V6Z"
                    transform="translate(-7 -1)"
                    fill="currentColor"
                  />
                </svg>
                <span className="text-dark">{file.name}</span>
              </div>
              <button onClick={() => removeFile(index)} className="no-outline h-4 w-4">
                <svg width="100%" height="100%" viewBox="0 0 19.799 19.799">
                  <g transform="translate(9.899) rotate(45)">
                    <path d="M14,8H8v6H6V8H0V6H6V0H8V6h6Z" fill="#394a5d" />
                  </g>
                </svg>
              </button>
            </li>
          ))}
        </ul>

        <Button btnStyle="outline" size="md" block className="mt-2.5 text-xs" onClick={addFile}>
          Add material
          <svg width="10" height="10" viewBox="0 0 14 14">
            <path d="M19,13H13v6H11V13H5V11h6V5h2v6h6Z" transform="translate(-5 -5)" fill="currentColor" />
          </svg>
        </Button>
      </div>
      <div className="mb-5 sm:mb-6">
        <InputField
          placeholder=""
          label="Select a deadline for this case study"
          name="caseDeadline"
          type="date"
          value={caseStudy.caseDeadline}
          onChange={(e) => {
            const { value } = e.target;
            setCaseStudy({ ...caseStudy, caseDeadline: value });
          }}
        />
      </div>
      <Button
        btnStyle="outline"
        size="lg"
        centralize
        onClick={() => handleAddCase && handleAddCase(true)}
        className="w-full mb-3"
      >
        {caseStudy.draft && addCaseState === "loading" ? "Loading..." : "Save As a Draft..."}
      </Button>
      <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
        <Button btnStyle="outline" size="lg" centralize className="text-xs" onClick={goNext}>
          GO BACK TO CASE MODEL ANSWER SETUP
        </Button>
        <Button btnStyle="basic" size="lg" centralize onClick={goNext}>
          PROCEED TO CME QUESTIONS
        </Button>
      </div>
    </>
  );
};

export default DoctorMaterialsAndDeadline;
