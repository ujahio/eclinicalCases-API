import { Button } from "@/components/uibutton";
import { formatDate } from "@/utils/formatDate";
import PlateViewer from "@/lib/PlateViewer";
import { FC } from "react";

interface StudentCasePresentationProps {
	goNext: () => void;
	caseDescription: string;
	caseDeadline: string;
}

const StudentCasePresentation: FC<StudentCasePresentationProps> = ({
	goNext,
	caseDescription,
	caseDeadline,
}) => {
	return (
		<>
			<div className="mb-5 sm:mb-6">
				<h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-2.5">
					Case Description
				</h6>
				<div className="mb-9 bg-gray-200 p-2.5">
					<PlateViewer htmlString={caseDescription} />
				</div>
			</div>
			{caseDeadline && (
				<div className="mb-5 sm:mb-6">
					<h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-2.5">
						Deadline
					</h6>
					<p className="text-dark sm:text-base text-1sm">
						{formatDate(caseDeadline)}
					</p>
				</div>
			)}
			<div className="grid grid-cols-1 gap-4">
				<Button
					variant="basic"
					className="w-full flex items-center justify-center gap-2 sm:text-sm cursor-pointer"
					size="lg"
					centralize
					onClick={goNext}
				>
					<span>PROCEED</span>
				</Button>
			</div>
		</>
	);
};

export default StudentCasePresentation;
