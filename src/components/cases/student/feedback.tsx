import React, { FunctionComponent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";
import { TextArea } from "@/components/form-elements";
import Button from "@/components/ui/Button";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import {
	addFeedback,
	resetAddFeedbackStatus,
} from "@/store/slices/student/addFeedbackSlice";

interface StudentFeedbackProps {
	goNext: () => void;
}

const StudentFeedback: FunctionComponent<StudentFeedbackProps> = ({
	goNext,
}) => {
	const params = useParams<{ id: string }>();
	const feedbackState = useAppSelector((state) => state.addFeedback);
	const dispatch = useAppDispatch();
	const [feedback, setFeedback] = useState(getFeedbackInfo());

	const updateFeedback = (option: string, value: string) => {
		const feedbackCopy = feedback.map((item) =>
			item.key === option ? { ...item, response: value } : item
		);

		setFeedback(feedbackCopy);
	};

	const isChecked = (option: string, value: string) => {
		const feedbackItem = feedback.find((item) => item.key === option);
		return feedbackItem?.response === value;
	};

	const handleAddFeedback = () => {
		dispatch(addFeedback({ caseID: params.id, feedback }));
	};

	useEffect(() => {
		console.log(feedbackState);
		if (feedbackState.status === "succeeded") {
			dispatch(resetAddFeedbackStatus());
			toast.success(feedbackState.feedback.message, {
				position: "top-right",
				autoClose: 5000,
			});
		} else if (feedbackState.status === "failed") {
			toast.error("Error sending feedback", {
				position: "top-right",
				autoClose: 5000,
			});
		}
	}, [feedbackState, dispatch]);

	return (
		<>
			<h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-2.5">
				Feedback
			</h6>
			<ul className="flex flex-col space-y-5 sm:space-y-6 mt-5 mb-5 sm:mb-6">
				{questions.map(({ question, type, key: id }, index) => (
					<li key={id}>
						<h5 className="text-dark text-sm sm:text-1sm font-medium mb-2.5">
							{index + 1}. {question}
						</h5>
						<div className="flex items-center flex-wrap">
							{type === "responses" &&
								responses.map((response, responseIndex) => (
									<label
										key={responseIndex}
										htmlFor={`feedback-${id}-${responseIndex}`}
										className={`mr-3 my-1.25 inline-flex items-center p-1.25 sm:p-1.5 transition-all border cursor-pointer ${
											isChecked(id, response)
												? "bg-primary-50 border-primary-300"
												: "bg-neutral-200"
										}`}
									>
										<input
											type="radio"
											name={`feedback-${id}`}
											id={`feedback-${id}-${responseIndex}`}
											className="hidden"
											checked={isChecked(id, response)}
											onChange={() => updateFeedback(id, response)}
										/>
										<span className="ml-2 mr-2 text-xs sm:text-1xs text-dark">
											{response}
										</span>
									</label>
								))}

							{type === "textarea" && (
								<TextArea
									label=""
									name={`feedback-${id}`}
									placeholder="Please enter any extra feedback"
									onChange={(e) => updateFeedback(id, e.target.value)}
								/>
							)}
						</div>
					</li>
				))}
			</ul>
			<div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
				<Button
					btnStyle="basic"
					size="lg"
					centralize
					onClick={handleAddFeedback}
				>
					{feedbackState.status === "loading"
						? "Loading..."
						: "Submit feedback"}
				</Button>
				<Button btnStyle="outline" size="lg" centralize onClick={goNext}>
					Certificate
				</Button>
			</div>
		</>
	);
};

const responses = [
	"Strongly disagree",
	"Disagree",
	"No comment",
	"Agree",
	"Strongly disagree",
];

const questions = [
	{
		question:
			"The case subject represents new knowledge or strengthens existing knowledge.",
		key: "questionOne",
		type: "responses",
	},
	{
		question:
			"The case subject would better help or strengthen my interpretation of clinical laboratory results",
		key: "questionTwo",
		type: "responses",
	},
	{
		question:
			"The case would help impact or strengthen my care of patients in the subject area",
		key: "questionThree",
		type: "responses",
	},
	{
		question: "My user experience of the app was good",
		key: "questionFour",
		type: "responses",
	},
	{
		question:
			"Are there any suggestions of future case subject areas, and or improvement for the app?",
		key: "questionFive",
		type: "textarea",
	},
];

const getFeedbackInfo = () =>
	questions.map(({ question, key }) => ({ question, key, response: "" }));

export default StudentFeedback;
