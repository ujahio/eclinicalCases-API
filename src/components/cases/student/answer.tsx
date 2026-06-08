import { FC, useState } from "react";
import { Button } from "@/components/ui/Button";
import PlateViewer from "@/lib/PlateViewer";
import ActionButtons from "@/components/ActionButtons";

interface StudentCaseAnswerProps {
	goNext: () => void;
	goBack: () => void | undefined;
	caseExplanation: any;
	studentCaseExplanation: string;
}

const StudentCaseAnswer: FC<StudentCaseAnswerProps> = ({
	goNext,
	goBack,
	caseExplanation,
	studentCaseExplanation,
}) => {
	const [compareMode, setCompareMode] = useState<boolean>(false);

	return (
		<>
			<div className="flex items-center justify-end mb-4">
				<Button
					btnStyle="outline"
					size="sm"
					centralize
					className="mb-2.5"
					onClick={() => setCompareMode(!compareMode)}
				>
					{compareMode ? "Hide Your Answer" : "View Your Answer"}
				</Button>
			</div>

			{!compareMode && (
				<div className="mb-5 sm:mb-6">
					<h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mr-3-75 mb-2.5">
						CASE MODEL ANSWER
					</h6>
					<div className="text-dark sm:text-base text-1sm">
						<div className="mb-9 bg-gray-200 p-2.5">
							<PlateViewer jsonString={caseExplanation} />
						</div>
					</div>
				</div>
			)}

			{compareMode && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
					{/* Student's response */}
					<div>
						<h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-2.5">
							YOUR RESPONSE
						</h6>
						<div className="mb-5 sm:mb-6">
							<div className="max-h-87.5 overflow-y-auto rounded-md border border-grey-200 p-3">
								<div className="text-dark sm:text-base text-1sm">
									<div className="bg-gray-200 p-2.5">
										<PlateViewer jsonString={studentCaseExplanation} />
									</div>
								</div>
							</div>
						</div>
					</div>
					{/* Teacher's model answer */}
					<div>
						<h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-2.5">
							CASE MODEL ANSWER
						</h6>
						<div className="mb-5 sm:mb-6">
							<div className="max-h-87.5 overflow-y-auto rounded-md border border-grey-200 p-3">
								<div className="text-dark sm:text-base text-1sm">
									<div className="bg-gray-200 p-2.5">
										<PlateViewer jsonString={caseExplanation} />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
			<ActionButtons goNext={goNext} goBack={goBack} />
		</>
	);
};

export default StudentCaseAnswer;
