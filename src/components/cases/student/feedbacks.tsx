import { TextArea } from "@/components/form-elements";
import Button from "@/components/ui/Button";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import {
	addFeedback,
	resetAddFeedbackStatus,
} from "@/store/slices/student/addFeedbackSlice";
import { useParams } from "next/navigation";
import React, { FunctionComponent, useEffect, useState } from "react";

interface StudentFeedbacksProps {
	goNext: () => void;
}

const StudentFeedbacks: FunctionComponent<StudentFeedbacksProps> = ({
	goNext,
}) => {
	const params = useParams<{ id: string }>();
	const feedbackState = useAppSelector((state) => state.addFeedback);
	const dispatch = useAppDispatch();
	const [feedback, setFeedback] = useState(getFeedbacks());

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
		const feedbackData = feedback.map(({ question, response }) => ({
			question,
			response: response || "",
		}));
		dispatch(addFeedback({ caseID: params.id, feedback: feedbackData }));
	};

	useEffect(() => {
		if (feedbackState.status === "succeeded") {
			dispatch(resetAddFeedbackStatus());
		}
	}, [feedbackState.status, dispatch]);

	return (
		<>
			<h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-2.5">
				Feedbacks
			</h6>
			<ul className="flex flex-col space-y-5 sm:space-y-6 mt-5 mb-5 sm:mb-6">
				{questions.map(({ question, type, key: id }, index) => (
					<li key={id}>
						<h5 className="text-dark text-sm sm:text-1sm font-medium mb-2.5">
							{index + 1}. {question}
						</h5>
						<div className="flex items-center flex-wrap">
							{type === "rating" &&
								feedbackRatings.map((rating, ratingIndex) => (
									<label
										key={ratingIndex}
										htmlFor={`feedback-${id}-${ratingIndex}`}
										className={`mr-3 my-1.25 inline-flex items-center p-1.25 sm:p-1.5 transition-all border cursor-pointer ${
											isChecked(id, ratingIndex.toString())
												? "bg-primary-50 border-primary-300"
												: "hover:bg-opacity-50 bg-neutral-200 bg-opacity-100 border-grey-border"
										}`}
									>
										<input
											type="radio"
											name={`feedback-${id}`}
											id={`feedback-${id}-${ratingIndex}`}
											className="hidden"
											checked={isChecked(id, ratingIndex.toString())}
											onChange={() =>
												updateFeedback(id, ratingIndex.toString())
											}
										/>
										<div
											className={`flex-shrink-0 inline-flex text-sm sm:text-xs items-center justify-center h-4 w-4 border sm:h-5 sm:w-5 font-bold transition-all ${
												isChecked(id, ratingIndex.toString())
													? "bg-primary-300 border-primary-300 text-white"
													: "bg-white border-grey-border text-dark"
											}`}
										>
											{ratingIndex + 1}
										</div>
										<span className="inline-block ml-2 text-xs sm:text-1xs text-dark pr-2">
											{rating}
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

const feedbackRatings = ["Very Bad", "Bad", "Average", "Good", "Very Good"];
const questions = [
	{
		question: "How did the questions go on a scale of 1-10?",
		key: "questionOne",
		type: "rating",
	},
	{
		question: "Were they educative?",
		key: "questionTwo",
		type: "rating",
	},
	{
		question: "Any suggestions to make the coming ones better?",
		key: "questionThree",
		type: "rating",
	},
	{
		question: "Any suggestions to make the coming ones better?",
		key: "questionFour",
		type: "rating",
	},
	{
		question: "Any other thing you'll like to share with us?",
		key: "questionFive",
		type: "textarea",
	},
];

const getFeedbacks = () => {
	return questions.map(({ question, key }) => ({
		question,
		key,
		response: "",
	}));
};

export default StudentFeedbacks;
