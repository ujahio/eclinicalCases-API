import Button from "@/components/ui/Button";
import { formatDate } from "@/utils/formatDate";
import { Editor } from "draft-js";
import React, { FunctionComponent } from "react";

interface StudentCasePresentationProps {
  goNext: () => void;
  caseDescription: any;
  caseClue: string;
  caseDeadline: string;
}

const StudentCasePresentation: FunctionComponent<StudentCasePresentationProps> = ({
  goNext,
  caseDescription,
  caseClue,
  caseDeadline,
}) => {
  const formattedDate = formatDate(caseDeadline);
  return (
    <>
      <div className="mb-5 sm:mb-6">
        <h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-2.5">Case Model Topic Clue</h6>
        <p className="text-dark sm:text-base text-1sm">{caseClue}</p>
      </div>
      <div className="mb-5 sm:mb-6">
        <h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-2.5">Case Model Topic Description</h6>
        <div className="mb-9 bg-gray-200 p-2.5">
          <Editor editorState={caseDescription} readOnly={true} onChange={() => {}} />
        </div>
      </div>
      <div className="mb-5 sm:mb-6">
        <h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-2.5">Deadline</h6>
        <p className="text-dark sm:text-base text-1sm">{formattedDate}</p>
      </div>
      <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
        <Button btnStyle="outline" size="lg" centralize href="/home">
          Go Back Home
        </Button>
        <Button btnStyle="basic" size="lg" centralize onClick={() => goNext()}>
          PROCEED TO THE CASE MODEL QUESTION
        </Button>
      </div>
    </>
  );
};

export default StudentCasePresentation;
