import { InputField } from "@/components/form-elements";
import Button from "@/components/ui/Button";
import React, { Fragment, FunctionComponent, useEffect, useState } from "react";
import { EditorState, convertFromRaw, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";

interface DoctorCaseQuestionProps {
  goNext: () => void;
  caseStudy: any;
  setCaseStudy: any;
}

const DoctorCaseQuestion: FunctionComponent<DoctorCaseQuestionProps> = ({ goNext, caseStudy, setCaseStudy }) => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (initialLoad && caseStudy.caseDescription) {
      try {
        const contentState = JSON.parse(caseStudy.caseDescription);
        if (contentState && contentState.blocks) {
          setEditorState(EditorState.createWithContent(convertFromRaw(contentState)));
        }
      } catch (e) {
        console.error("Failed to parse caseDescription:", e);
      }
      setInitialLoad(false);
    }
  }, [caseStudy.caseDescription, initialLoad]);

  const onEditorStateChange = (newEditorState: EditorState) => {
    setEditorState(newEditorState);
    const contentState = newEditorState.getCurrentContent();
    const contentStateJSON = convertToRaw(contentState);
    setCaseStudy((prevCaseStudy: any) => ({
      ...prevCaseStudy,
      caseDescription: JSON.stringify(contentStateJSON),
    }));
  };
  return (
    <>
      <div className="mb-5 sm:mb-6">
        <h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-2.5">Case Model Setup</h6>
        <InputField
          placeholder="Case model clue"
          label="Case model clue"
          name="caseClue"
          value={caseStudy.caseClue}
          onChange={(e) => {
            const { value } = e.target;
            setCaseStudy({ ...caseStudy, caseClue: value });
          }}
        />

        <div className="mt-5">
          <label className="text-grey-300 text-1sm capitalize font-normal">Case Model Description</label>
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
      <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
        <Button btnStyle="outline" size="lg" centralize>
          GO BACK HOME
        </Button>
        <Button btnStyle="basic" size="lg" className="text-xs" centralize onClick={() => goNext()}>
          PROCEED TO CASE MODEL ANSWER SETUP
        </Button>
      </div>
    </>
  );
};

export default DoctorCaseQuestion;
