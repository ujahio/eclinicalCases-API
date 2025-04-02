import React, { FunctionComponent } from "react";
import ResponseModal from "../cases/teacher/response";
import FeedbackModal from "../cases/teacher/feedback";
import Modal, { ModalProps } from "../ui/Modal";
import useProcessTabs from "@/services/hooks/useProcessTabs";
import Image from "next/image";
import Tabs from "../ui/Tabs";

import { formatDate } from "@/utils/formatDate";

const tabs = ["Response", "Feedback"];

const ResponseFeedbackModal: FunctionComponent<ModalProps> = ({
	show,
	toggle,
	studentInfo,
}) => {
	const { isActive, active, switchTab } = useProcessTabs(tabs, 0);
	return (
		<Modal {...{ show, toggle, size: "lg" }}>
			<div className="flex mb-4">
				<Image
					src="/images/student1.png"
					alt="user image"
					className="h-12 w-auto"
					width={120}
					height={120}
				/>{" "}
				<div className="ml-3">
					<h2 className="text-lg text-dark font-medium">
						{studentInfo?.firstName} {studentInfo?.lastName}
					</h2>
					<p className="text-grey-300">
						<span className="font-medium">Submitted on:</span>{" "}
						{formatDate(studentInfo?.submittedAt)}
					</p>
				</div>
			</div>

			<div className="border-b border-grey-400 border-opacity-40 h-11.25 sm:h-12.5 relative">
				<Tabs tabs={tabs} changeTab={switchTab} active={active} />
			</div>

			<div className="items-center mt-5 sm:mt-7">
				{isActive("response") && (
					<ResponseModal caseExplanation={studentInfo?.caseExplanation} />
				)}
				{isActive("feedback") && (
					<FeedbackModal feedback={studentInfo?.feedback} />
				)}
			</div>
		</Modal>
	);
};

export default ResponseFeedbackModal;
