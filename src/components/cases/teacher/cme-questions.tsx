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
            <div className="create-case-container">
                {/* Card wrapper to match design */}
                <div className="border border-grey-border rounded-md bg-white p-6">
                    <ul className="mb-0 sm:mb-0 divide-y divide-grey-border divide-opacity-50">
                        {caseStudy.caseQuestions.map((question: any, index: number) => (
                            <li className="py-6 first:pt-0 last:pb-0" key={index}>
                                <div className="flex items-center justify-between">
                                    <div className="text-blue text-1sm sm:text-base capitalize font-bold">
                                        Question {index + 1}
                                    </div>
                                    <Button
                                        size="sm"
                                        btnStyle="outline"
                                        className="mb-1-25 hover:text-red"
                                        aria-label="delete question"
                                        onClick={() => deleteQuestion(index)}
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

                                <InputField
                                    label=""
                                    placeholder={`Enter question ${index + 1}`}
                                    name={`question-${index}`}
                                    value={question.question}
                                    onChange={(e) => updateQuestionText(e, index)}
                                />

                                <div className="mt-8">
                                    <div className="flex items-center justify-between mb-1-25">
                                        <div className="text-grey-300 text-1sm capitalize font-medium">
                                            Options
                                        </div>
                                        <Button
                                            size="sm"
                                            btnStyle="outline"
                                            onClick={() => addEmptyOption(index)}
                                        >
                                            + Add Option
                                        </Button>
                                    </div>
                                    <ul>
                                        {question.options.map((option: any, optionIndex: number) => (
                                            <li className="flex items-stretch mt-2.5" key={optionIndex}>
                                                <label
                                                    htmlFor={`question-${index}-option-${optionIndex}`}
                                                    className="h-12 sm:h-12 px-3 border border-grey-border flex items-center justify-center rounded-xs mr-2.5 cursor-pointer"
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`question-${index}-option`}
                                                        id={`question-${index}-option-${optionIndex}`}
                                                        className="hidden"
                                                        onChange={() => updateAnswer(index, optionIndex)}
                                                    />
                                                    <div
                                                        className={`h-5 w-5 rounded-full border inline-flex items-center justify-center transition-colors ${
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
                                                        placeholder={`Enter option ${optionIndex + 1}`}
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

                {/* Full width Add Question button (design) */}
                <div className="mb-6 mt-6">
                    <Button
                        btnStyle="outline"
                        className="w-full flex items-center justify-between px-4"
                        onClick={addEmptyQuestion}
                    >
                        <span>ADD QUESTION</span>
                        <span className="text-2xl leading-none">+</span>
                    </Button>
                </div>

                {/* Action buttons in two columns on larger screens */}
                <div className="create-case-actions sm:grid sm:grid-cols-2 gap-4 items-center">
                    <Button
                        btnStyle="outline"
                        centralize
                        className="w-full flex items-center justify-center gap-2"
                        onClick={goBack}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>GO BACK TO MATERIALS AND DEADLINE</span>
                    </Button>
                    <Button
                        btnStyle="basic"
                        centralize
                        className="w-full flex items-center justify-center gap-2"
                        onClick={goNext}
                    >
                        <span>PROCEED TO FINAL REVIEW</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Button>
                </div>
            </div>
        </>
    );
};

export default TeacherCMEQuestions;
