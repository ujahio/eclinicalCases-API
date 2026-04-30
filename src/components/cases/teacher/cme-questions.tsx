import { InputField } from "@/components/form-elements";
import Button from "@/components/ui/Button";
import { useAppSelector } from "@/services/hooks/hooks";
import { TeacherCMEQuestionsProps } from "@/services/types/teacher/createCaseStudy";
import { FC } from "react";

const TeacherCMEQuestions: FC<TeacherCMEQuestionsProps> = ({
	goNext,
	goBack,
	caseStudy,
	setCaseStudy,
	handleUpdateDraftCase,
}) => {
	const addingDraftCaseStatus = useAppSelector(
		(state) => state.getDraftCases.status,
	);
	const updateQuestionText = (
		e: React.ChangeEvent<HTMLInputElement>,
		index: number,
	) => {
		const updatedQuestions = caseStudy.caseQuestions.map((q, i) =>
			i === index ? { ...q, question: e.target.value } : q,
		);
		setCaseStudy({ ...caseStudy, caseQuestions: updatedQuestions });
	};

	const addEmptyOption = (questionIndex: number) => {
		const updatedQuestions = caseStudy.caseQuestions.map((q: any, i: any) =>
			i === questionIndex ? { ...q, options: [...q.options, ""] } : q,
		);
		setCaseStudy({ ...caseStudy, caseQuestions: updatedQuestions });
	};

	const updateOptionText = (
		e: React.ChangeEvent<HTMLInputElement>,
		questionIndex: number,
		optionIndex: number,
	) => {
		const updatedQuestions = caseStudy.caseQuestions.map((q: any, i: any) =>
			i === questionIndex
				? {
						...q,
						options: q.options.map((option: any, idx: any) =>
							idx === optionIndex ? e.target.value : option,
						),
					}
				: q,
		);
		setCaseStudy({ ...caseStudy, caseQuestions: updatedQuestions });
	};

	const deleteOption = (questionIndex: number, optionIndex: number) => {
		const updatedQuestions = caseStudy.caseQuestions.map((q: any, i: any) =>
			i === questionIndex
				? {
						...q,
						options: q.options.filter(
							(_: any, idx: any) => idx !== optionIndex,
						),
					}
				: q,
		);
		setCaseStudy({ ...caseStudy, caseQuestions: updatedQuestions });
	};

	const addEmptyQuestion = () => {
		const newQuestion = {
			question: "",
			options: [],
			correctAnswer: 0,
		};
		setCaseStudy({
			...caseStudy,
			caseQuestions: [...caseStudy.caseQuestions, newQuestion],
		});
	};

	const deleteQuestion = (index: number) => {
		const updatedQuestions = caseStudy.caseQuestions.filter(
			(_: any, i: any) => i !== index,
		);
		setCaseStudy({ ...caseStudy, caseQuestions: updatedQuestions });
	};

	const updateAnswer = (questionIndex: number, optionIndex: number) => {
		const updatedQuestions = caseStudy.caseQuestions.map((q: any, i: any) =>
			i === questionIndex ? { ...q, correctAnswer: optionIndex } : q,
		);
		setCaseStudy({ ...caseStudy, caseQuestions: updatedQuestions });
	};

	const isCorrectAnswer = (questionIndex: number, optionIndex: number) =>
		caseStudy.caseQuestions[questionIndex].correctAnswer === optionIndex;

	return (
		<>
			{/* Card wrapper to match design */}
			<div className="border border-grey-border rounded-md bg-white p-6">
				<ul className="mb-0 sm:mb-0 divide-y divide-grey-border divide-opacity-50">
					{caseStudy.caseQuestions.map((question: any, index: number) => (
						<li className="py-6 first:pt-0 last:pb-0" key={index}>
							<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
								<div className="text-blue text-1sm sm:text-base capitalize font-bold">
									{`Question ${index + 1}`}
								</div>
								<div className="flex flex-wrap justify-end gap-2">
									<Button
										size="sm"
										btnStyle="outline"
										onClick={() => addEmptyOption(index)}
										className="text-xs px-2"
									>
										ADD A NEW OPTION
									</Button>

									<Button
										size="sm"
										btnStyle="outline"
										aria-label="delete question"
										onClick={() => deleteQuestion(index)}
										className="hover:text-red"
									>
										<svg width="11.5" viewBox="0 0 12.833 16.5">
											<path
												d="M10.917,20.667A1.833,1.833,0,0,0,12.75,22.5h7.333a1.833,1.833,0,0,0,1.833-1.833v-11h-11ZM22.833,6.917H19.625L18.708,6H14.125l-.917.917H10V8.75H22.833Z"
												transform="translate(-10 -6)"
												fill="currentColor"
											/>
										</svg>
									</Button>
								</div>
							</div>

							<InputField
								label=""
								placeholder="Question"
								name={`question-${index}`}
								value={question.question}
								onChange={(e) => updateQuestionText(e, index)}
							/>

							<div className="mt-8">
								<div className="mb-3">
									<div className="text-grey-300 text-1sm font-medium">
										Options for Question {index + 1}
									</div>
								</div>
								<ul className="space-y-3">
									{question.options.map((option: any, optionIndex: number) => (
										<li className="flex items-start gap-3" key={optionIndex}>
											<label
												htmlFor={`question-${index}-option-${optionIndex}`}
												className="h-12 w-12 border border-grey-border flex items-center justify-center rounded-xs mr-2.5 cursor-pointer"
											>
												<input
													type="radio"
													name={`question-${index}-option`}
													id={`question-${index}-option-${optionIndex}`}
													className="hidden"
													onChange={() => updateAnswer(index, optionIndex)}
												/>
												<div
													className={`h-6 w-6 rounded-full border inline-flex items-center justify-center transition-colors ${
														isCorrectAnswer(index, optionIndex)
															? "bg-dark"
															: "border-grey-400"
													}`}
												>
													<svg
														width="8"
														viewBox="0 0 18.006 12.373"
														className={`text-white transition-opacity ${
															isCorrectAnswer(index, optionIndex)
																? "opacity-100"
																: "opacity-0"
														}`}
													>
														<path
															d="M-15890.717,19582.234l6.221,5.416,10.426-10.3"
															transform="translate(15891.373 -19576.641)"
															fill="none"
															stroke="currentColor"
															strokeWidth="2.5"
														/>
													</svg>
												</div>
											</label>
											<div className="flex-1">
												<InputField
													name={`question-${index}-option-${optionIndex}-value`}
													label=""
													placeholder="Option"
													value={option}
													onChange={(e) =>
														updateOptionText(e, index, optionIndex)
													}
												>
													<button
														className="absolute no-outline p-2 right-2 transition-colors text-grey-300 hover:text-red"
														onClick={() => deleteOption(index, optionIndex)}
														type="button"
													>
														<svg width="18" viewBox="0 0 25 25">
															<circle
																cx="12.5"
																cy="12.5"
																r="11.5"
																fill="none"
																stroke="currentColor"
																strokeWidth="2"
															/>
															<line
																y2="10"
																transform="translate(17.5 12.5) rotate(90)"
																fill="none"
																stroke="currentColor"
																strokeWidth="2"
															/>
														</svg>
													</button>
												</InputField>
											</div>
										</li>
									))}
								</ul>
							</div>
						</li>
					))}
				</ul>
			</div>
			{/* Full width Add Question button (design) - use native button so we can enforce a light-gray background */}
			<div className="mb-6 mt-6">
				<button
					type="button"
					onClick={addEmptyQuestion}
					className={
						"sm:text-sm cursor-pointer rounded-md border border-grey-border outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-100 flex items-center uppercase relative font-medium w-full justify-between px-4 py-3 bg-grey-100 text-dark gap-2"
					}
				>
					<span className="pl-2">ADD QUESTION</span>
					<span className="text-2xl leading-none">+</span>
				</button>
			</div>
			{/* Action buttons in two columns on desktop */}
			<div className="create-case-actions grid md:grid-cols-2 gap-4 items-center">
				<Button
					btnStyle="outline"
					centralize
					className="w-full flex items-center justify-center gap-2 sm:text-sm cursor-pointer"
					onClick={goBack}
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M15 18l-6-6 6-6"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
					<span>GO BACK</span>
				</Button>
				<Button
					btnStyle="basic"
					centralize
					className="w-full flex items-center justify-center gap-2 sm:text-sm cursor-pointer"
					onClick={goNext}
				>
					<span>PROCEED</span>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M9 6l6 6-6 6"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</Button>
			</div>
		</>
	);
};

export default TeacherCMEQuestions;
