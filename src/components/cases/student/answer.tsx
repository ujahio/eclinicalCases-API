import Button from "@/components/ui/Button";
import { useAppSelector } from "@/services/hooks/hooks";
import { convertFromRaw, Editor, EditorState } from "draft-js";
import React, { FC, useState } from "react";

interface StudentCaseAnswerProps {
  goNext: () => void;
  goBack: () => void;
  caseTopicAnswer: string;
  caseExplanation: any;
}

const StudentCaseAnswer: FC<StudentCaseAnswerProps> = ({ goNext, goBack, caseTopicAnswer, caseExplanation }) => {
  const caseDetailsState = useAppSelector((state) => state.caseDetails.caseDetails?.data);
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const rawContent =
    caseDetailsState && caseDetailsState.caseExplanation
      ? JSON.parse(caseDetailsState.caseExplanation)
      : { blocks: [], entityMap: {} };
  const rawContent1 = caseExplanation ? JSON.parse(caseExplanation) : { blocks: [], entityMap: {} };
  const teacherCaseDescription = EditorState.createWithContent(convertFromRaw(rawContent));
  const caseExplanationT = EditorState.createWithContent(convertFromRaw(rawContent1));
  return (
    <>
      <div className="flex items-center justify-end mb-4">
        <Button btnStyle="outline" size="sm" centralize className="mb-2.5" onClick={() => setCompareMode(!compareMode)}>
          {compareMode ? "Hide Your Answer" : "View Your Answer"}
        </Button>
      </div>
      {!compareMode && (
        <div className="mb-5 sm:mb-6">
          <h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mr-3.75 mb-2.5">TEACHER’S MODEL ANSWER</h6>
          <h6 className="text-1xs sm:text-sm font-medium text-grey-300 uppercase mb-2.5">
            {caseDetailsState?.caseTopic}
          </h6>
          <div className="text-dark sm:text-base text-1sm">
            <div className="mb-9 bg-gray-200 p-2.5">
              <Editor editorState={teacherCaseDescription} readOnly={true} onChange={() => {}} />
            </div>
          </div>
        </div>
      )}
      {compareMode && (
        <div className="flex flex-col md:justify-between md:flex-row">
          <div className="md:w-45%">
            <div className="flex items-center justify-between flex-wrap mb-4">
              <h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mr-3.75 mb-2.5">YOUR MODEL ANSWER</h6>
            </div>
            <div className="mb-5 sm:mb-6">
              <h6 className="text-1xs sm:text-sm font-medium text-grey-300 uppercase mb-2.5">{caseTopicAnswer}</h6>
              <div className="text-dark sm:text-base text-1sm">
                <div className="mb-9 bg-gray-200 p-2.5">
                  <Editor editorState={caseExplanationT} readOnly={true} onChange={() => {}} />
                </div>
              </div>
            </div>
          </div>
          <div className="md:w-45%">
            <div className="flex items-center justify-between flex-wrap mb-4">
              <h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mr-3.75 mb-2.5">
                TEACHER’S MODEL ANSWER
              </h6>
            </div>
            <div className="mb-5 sm:mb-6">
              <h6 className="text-1xs sm:text-sm font-medium text-grey-300 uppercase mb-2.5">
                {caseDetailsState?.caseTopic}
              </h6>
              <div className="text-dark sm:text-base text-1sm">
                <div className="mb-9 bg-gray-200 p-2.5">
                  <Editor editorState={teacherCaseDescription} readOnly={true} onChange={() => {}} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="border-grey-border border rounded-sm p-3 sm:p-6 mb-5 sm:mb-6">
        <h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-2.5">FURTHER LEARNING MATERIALS</h6>

        <ul className="flex flex-col w-full space-y-3">
          {caseDetailsState?.caseMaterials?.map((material: any, index: number) => {
            // Replace backslashes with forward slashes in the file path
            const filePath = material.filePath.replace(/\\/g, "/");
            const fileExtension = material.filename.split(".").pop().toUpperCase();
            return (
              <li key={index}>
                <a
                  href={filePath}
                  download={material.filename}
                  className="flex items-center p-2 border-grey-400 border rounded-sm"
                >
                  <div className="bg-dark p-1.25 text-white font-medium text-xs rounded-sm">{fileExtension}</div>
                  <span className="text-1sm sm:text-sm text-dark inline-block ml-2 sm:ml-2.5">{material.filename}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
        <Button btnStyle="outline" size="lg" centralize onClick={() => goBack()}>
          BACK TO CASE MODEL QUESTIONS
        </Button>
        <Button btnStyle="basic" size="lg" centralize onClick={() => goNext()}>
          PROCEED TO THE CME QUESTIONS
        </Button>
      </div>
    </>
  );
};

export default StudentCaseAnswer;
