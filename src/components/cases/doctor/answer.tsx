import { InputField } from "@/components/form-elements";
import Button from "@/components/ui/Button";
import React, { Fragment, FunctionComponent, useEffect, useState } from "react";
import { EditorState, convertFromRaw, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import { useAppSelector } from "@/services/hooks/hooks";

interface DoctorCaseAnswerProps {
  goNext: () => void;
  caseStudy: any;
  setCaseStudy: any;
  handleAddCase: any;
}

const DoctorCaseAnswer: FunctionComponent<DoctorCaseAnswerProps> = ({
  goNext,
  caseStudy,
  setCaseStudy,
  handleAddCase,
}) => {
  const [editorState, setEditorState] = useState(() =>
    caseStudy.caseExplanation
      ? EditorState.createWithContent(convertFromRaw(JSON.parse(caseStudy.caseExplanation)))
      : EditorState.createEmpty()
  );
  const addCaseState = useAppSelector((state) => state.addCase.status);

  useEffect(() => {
    // Update caseStudy state whenever editorState changes
    const contentState = editorState.getCurrentContent();
    const contentStateJSON = convertToRaw(contentState);
    setCaseStudy({
      ...caseStudy,
      caseExplanation: JSON.stringify(contentStateJSON),
    });
  }, [editorState, setCaseStudy]);

  const onEditorStateChange = (newEditorState: EditorState) => {
    setEditorState(newEditorState);
  };
  return (
    <>
      <div className="mb-5 sm:mb-6">
        <h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-2.5">Case Model Answer Setup</h6>
        <InputField
          placeholder="Case model topic"
          label="Case Model Topic"
          name="caseTopic"
          value={caseStudy.caseTopic}
          onChange={(e) => setCaseStudy({ ...caseStudy, caseTopic: e.target.value })}
        />

        <div className="mt-5">
          <label className="text-grey-300 text-1sm capitalize font-normal">Further Explanation</label>
          <Editor
            editorState={editorState}
            onEditorStateChange={onEditorStateChange}
            editorStyle={{
              height: "400px",
              border: "solid 1px #E7EBEF",
              padding: "0px 15px",
            }}
          />
        </div>
      </div>
      <Button btnStyle="outline" size="lg" centralize onClick={() => handleAddCase(true)} className="w-full mb-3">
        {caseStudy.draft && addCaseState === "loading" ? "Loading..." : "Save As a Draft..."}
      </Button>
      <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
        <Button btnStyle="outline" size="lg" centralize>
          GO BACK TO CASE MODEL SETUP
        </Button>
        <Button btnStyle="basic" size="lg" centralize onClick={() => goNext()}>
          PROCEED TO MATERIALS AND DEADLINE
        </Button>
      </div>
    </>
  );
};

export default DoctorCaseAnswer;
