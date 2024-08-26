import { Dispatch, SetStateAction } from "react";
// import { QuestionErrorProps, QuestionProps } from "@/components/cases/student/question";

const topicMinLength = 5;
const explanationMinLength = 10;

const studentCaseQuestionValidation = (
  input: any,
  setError: Dispatch<SetStateAction<any>>,
  editorTextContent: string
) => {
  let validated = true;

  if (input?.topic?.trim().length < topicMinLength) {
    setError((prevState: any) => ({
      ...prevState,
      topic: {
        status: "error",
        validationMessage: `Topic must be at least ${topicMinLength} characters!`,
      },
    }));
    validated = false;
  }

  if (editorTextContent.trim().length < explanationMinLength) {
    setError((prevState: any) => ({
      ...prevState,
      explanation: {
        status: "error",
        validationMessage: `Explanation must be at least ${explanationMinLength} characters!`,
      },
    }));
    validated = false;
  }

  return validated;
};

const validationLists = { studentCaseQuestionValidation };

export default validationLists;
