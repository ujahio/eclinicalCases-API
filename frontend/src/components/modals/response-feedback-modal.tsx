import React, { FunctionComponent, useEffect, useState } from "react";
import ResponseModal from "../cases/doctor/response";
import FeedbackModal from "../cases/doctor/feedback";
import student1 from "@/assets/images/student1.png";
import student2 from "@/assets/images/student2.png";
import student3 from "@/assets/images/student3.png";
import student4 from "@/assets/images/student4.png";
import Modal, { ModalProps } from "../ui/Modal";
import useProcessTabs from "@/services/hooks/useProcessTabs";
import Image from "next/image";
import Tabs from "../ui/Tabs";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import { fetchCaseData, resetCaseDataStatus } from "@/store/slices/case/getCaseDataSlice";
import { formatDate } from "@/utils/formatDate";

const tabs = ["Responses", "Feedback"];

const ResponseFeedbackModal: FunctionComponent<ModalProps> = ({ show, toggle, student, caseId }) => {
  const { isActive, active, switchTab } = useProcessTabs(tabs, 0);
  const caseDataState = useAppSelector((state) => state.getCaseData);
  const dispatch = useAppDispatch();

  const [currentRecordIndex, setCurrentRecordIndex] = useState(0);

  const data = caseDataState.caseData;
  const currentData = data ? data[currentRecordIndex] : null;

  const handleNext = () => {
    if (currentRecordIndex < data.length - 1) {
      setCurrentRecordIndex(currentRecordIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentRecordIndex > 0) {
      setCurrentRecordIndex(currentRecordIndex - 1);
    }
  };

  const handleFetchCaseData = (caseId: string) => {
    dispatch(fetchCaseData(caseId));
  };

  useEffect(() => {
    if (caseId) {
      handleFetchCaseData(caseId);
    }
  }, [caseId]);

  useEffect(() => {
    if (caseDataState.status === "succeeded") {
      dispatch(resetCaseDataStatus());
    }
  }, [caseDataState.status, dispatch]);

  return (
    <Modal {...{ show, toggle, size: "lg", student }}>
      <div>
        <div>
          {student == "selectedStudent" && (
            <div className="flex mb-4">
              <Image src={student1} alt="" className="h-12 w-auto" />{" "}
              <div className="ml-3">
                <h2 className="text-lg text-dark font-medium">
                  {currentData?.student?.firstName} {currentData?.student?.lastName}
                </h2>
                <p className="text-grey-300">
                  <span className="font-medium">Submitted on:</span> {formatDate(currentData?.feedback[0]?.createdAt)}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="border-b border-grey-400 border-opacity-40 h-11.25 sm:h-12.5 relative">
          <Tabs tabs={tabs} changeTab={switchTab} active={active} />
        </div>

        <div className="items-center mt-10 sm:mt-12.5">
          {isActive("responses") && <ResponseModal answers={currentData?.answers} />}
          {isActive("feedback") && <FeedbackModal feedback={currentData?.feedback[0]} />}
        </div>
        <div className="flex justify-between mt-6">
          <button
            onClick={handlePrevious}
            disabled={currentRecordIndex === 0}
            className="px-4 py-2 bg-gray-300 text-white rounded"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={currentRecordIndex === data?.length - 1}
            className="px-4 py-2 bg-gray-300 text-white rounded"
          >
            Next
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ResponseFeedbackModal;
