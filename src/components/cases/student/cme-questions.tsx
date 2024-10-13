import Button from "@/components/ui/Button";
import CmeModal from "@/components/ui/cme-modal";
import { useAppSelector } from "@/services/hooks/hooks";
import React, { FunctionComponent, useState } from "react";

type Answer = {
	question: string;
	options: string[];
	studentAnswer: number | null;
};

interface StudentCMEQuestionsProps {
	goBack: () => void;
	caseDetails: {
		answers: Answer[];
	};
	setCaseDetails: React.Dispatch<React.SetStateAction<any>>;
	handleSubmitResponse: any;
}

const StudentCMEQuestions: FunctionComponent<StudentCMEQuestionsProps> = ({
	goBack,
	caseDetails,
	setCaseDetails,
	handleSubmitResponse,
}) => {
	const [showCmeModal, setShowCmeModal] = useState(false);
	const submitResponseState = useAppSelector(
		(state) => state.submitCaseResponse.status
	);

	const setAnswer = (index: number, value: number | null) => {
		const newAnswers = [...caseDetails.answers];
		newAnswers[index].studentAnswer = value;
		setCaseDetails({ ...caseDetails, answers: newAnswers });
	};

	const isChecked = (studentAnswer: number | null, value: number) => {
		return studentAnswer === value;
	};

	return (
		<>
			<h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-2.5">
				CASE MODEL MULTI CHOICE QUESTIONS
			</h6>
			<ul className="flex flex-col space-y-5 sm:space-y-6 mt-5 mb-5 sm:mb-6">
				{caseDetails.answers.map(({ question, options }, index) => {
					const questionNumber = index + 1;
					return (
						<li key={`question-${questionNumber}`}>
							<h5 className="text-dark text-sm sm:text-1sm font-medium mb-2.5">
								{questionNumber}. &nbsp;&nbsp; {question}
							</h5>
							{options.map((option, optionIndex) => {
								const optionNumber = optionIndex;
								return (
									<label
										key={`option-${optionNumber}`}
										className="flex items-center no-outline w-full border border-grey-border bg-white p-2.5 mb-3 cursor-pointer block"
									>
										<input
											className="hidden"
											type="radio"
											name={`question-${questionNumber}`}
											id={`option-${optionNumber}`}
											onChange={() => setAnswer(index, optionIndex)}
											checked={isChecked(
												caseDetails.answers[index].studentAnswer,
												optionIndex
											)}
										/>
										<div
											className={`h-4 w-4 rounded-full border inline-flex items-center justify-center transition-colors ${
												isChecked(
													caseDetails.answers[index].studentAnswer,
													optionIndex
												)
													? "bg-dark"
													: "border-grey-400"
											}`}
										>
											{isChecked(
												caseDetails.answers[index].studentAnswer,
												optionIndex
											) && (
												<svg
													width="8"
													viewBox="0 0 18.006 12.373"
													className="text-white"
												>
													<path
														d="M-15890.717,19582.234l6.221,5.416,10.426-10.3"
														transform="translate(15891.373 -19576.641)"
														fill="none"
														stroke="currentColor"
														strokeWidth="2.5"
													/>
												</svg>
											)}
										</div>
										<span className="text-grey-300 inline-block ml-2.5">
											{option}
										</span>
									</label>
								);
							})}
						</li>
					);
				})}
			</ul>
			<div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
				<Button btnStyle="outline" size="lg" centralize onClick={goBack}>
					View Model Answer
				</Button>
				<Button
					btnStyle="basic"
					size="lg"
					centralize
					onClick={() => {
						handleSubmitResponse();
						// setShowCmeModal(true);
					}}
				>
					{submitResponseState === "loading" ? "Loading..." : "Submit"}
				</Button>
			</div>
			<CmeModal show={showCmeModal} toggle={setShowCmeModal} />
		</>
	);
};

export default StudentCMEQuestions;
