import { InputField } from "@/components/form-elements";
import Button from "@/components/ui/Button";
import React, { FunctionComponent, ChangeEvent, useRef } from "react";
import { useAppSelector } from "@/services/hooks/hooks";

interface DoctorMaterialsAndDeadlineProps {
	goNext: () => void;
	goBack: () => void;
	caseStudy: any;
	setCaseStudy: React.Dispatch<React.SetStateAction<any>>;
	prevCaseMaterials: any;
	setPrevCaseMaterials: any;
	handleAddCase: React.Dispatch<React.SetStateAction<any>>;
}

const DoctorMaterialsAndDeadline: FunctionComponent<
	DoctorMaterialsAndDeadlineProps
> = ({
	goNext,
	goBack,
	caseStudy,
	setCaseStudy,
	prevCaseMaterials,
	setPrevCaseMaterials,
	handleAddCase,
}) => {
	const addingDraftCaseStatus = useAppSelector(
		(state) => state.getDraftCases.status
	);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const addFile = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const removeFile = (index: number, isExisting: boolean) => {
		if (!isExisting) {
			const updatedExistingFiles = caseStudy.caseMaterials.filter(
				(_: any, i: any) => i !== index
			);
			setCaseStudy({ ...caseStudy, caseMaterials: updatedExistingFiles });
		} else {
			// Remove file from prevCaseMaterials
			// const updatedPrevFiles = prevCaseMaterials.filter((_: any, i: any) => i !== index);
			// setPrevCaseMaterials(updatedPrevFiles);
		}
	};

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = e.target.files;
		if (selectedFiles) {
			const newFiles = Array.from(selectedFiles);
			setCaseStudy((prevCaseStudy: any) => ({
				...prevCaseStudy,
				caseMaterials: [...prevCaseStudy.caseMaterials, ...newFiles],
			}));
			// setPrevCaseMaterials([]);
		}
	};

	return (
		<>
			<h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-4">
				Deadline
			</h6>
			{/*TEMP COMMENT OUT UNTIL UPLOADING FILES IS WORKING*/}
			{/* <h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-4">
				Materials and deadline
			</h6> */}
			{/* <div className="mb-5 sm:mb-6">
				<label className="text-grey-300 text-1sm font-normal">
					Materials for further readings
				</label>
				<input
					type="file"
					ref={fileInputRef}
					className="hidden"
					accept=".doc,.docx,.pdf,.xls,.xlsx,.ppt,.pptx"
					onChange={handleFileChange}
					multiple
				/>
				<ul className="mt-3 space-y-2">
					{caseStudy.caseMaterials?.map((file: File, index: number) => (
						<li
							key={file.name}
							className="flex items-center justify-between px-5 py-2 border-grey-border bg-white border text-1xs sm:text-sm"
						>
							<div className="inline-flex items-center">
								<svg
									height="16"
									viewBox="0 0 11 22"
									className="mr-4 text-grey-300"
								>
									<path
										d="M16.5,6V17.5a4,4,0,0,1-8,0V5a2.5,2.5,0,0,1,5,0V15.5a1,1,0,0,1-2,0V6H10v9.5a2.5,2.5,0,0,0,5,0V5A4,4,0,0,0,7,5V17.5a5.5,5.5,0,0,0,11,0V6Z"
										transform="translate(-7 -1)"
										fill="currentColor"
									/>
								</svg>
								<span className="text-dark">{file.name}</span>
							</div>
							<button
								onClick={() => removeFile(index, false)}
								className="no-outline h-4 w-4"
							>
								<svg width="100%" height="100%" viewBox="0 0 19.799 19.799">
									<g transform="translate(9.899) rotate(45)">
										<path d="M14,8H8v6H6V8H0V6H6V0H8V6h6Z" fill="#394a5d" />
									</g>
								</svg>
							</button>
						</li>
					))}
					{prevCaseMaterials.map((file: any, index: number) => (
						<li
							key={file.name}
							className="flex items-center justify-between px-5 py-2 border-grey-border bg-white border text-1xs sm:text-sm"
						>
							<div className="inline-flex items-center">
								<svg
									height="16"
									viewBox="0 0 11 22"
									className="mr-4 text-grey-300"
								>
									<path
										d="M16.5,6V17.5a4,4,0,0,1-8,0V5a2.5,2.5,0,0,1,5,0V15.5a1,1,0,0,1-2,0V6H10v9.5a2.5,2.5,0,0,0,5,0V5A4,4,0,0,0,7,5V17.5a5.5,5.5,0,0,0,11,0V6Z"
										transform="translate(-7 -1)"
										fill="currentColor"
									/>
								</svg>
								<span className="text-dark">{file.filename}</span>
							</div>
							<button
								onClick={() => removeFile(index, true)}
								className="no-outline h-4 w-4"
							>
								<svg width="100%" height="100%" viewBox="0 0 19.799 19.799">
									<g transform="translate(9.899) rotate(45)">
										<path d="M14,8H8v6H6V8H0V6H6V0H8V6h6Z" fill="#394a5d" />
									</g>
								</svg>
							</button>
						</li>
					))}
				</ul>

				<Button
					btnStyle="outline"
					size="md"
					block
					className="mt-2.5 text-xs"
					onClick={addFile}
				>
					Add material
					<svg width="10" height="10" viewBox="0 0 14 14">
						<path
							d="M19,13H13v6H11V13H5V11h6V5h2v6h6Z"
							transform="translate(-5 -5)"
							fill="currentColor"
						/>
					</svg>
				</Button>
			</div> */}
			<div className="mb-5 sm:mb-6">
				<InputField
					placeholder=""
					label="Select a deadline for this case study"
					name="caseDeadline"
					type="date"
					value={caseStudy.caseDeadline}
					onChange={(e) => {
						const { value } = e.target;
						setCaseStudy({ ...caseStudy, caseDeadline: value });
					}}
				/>
			</div>
			<Button
				btnStyle="outline"
				size="lg"
				centralize
				onClick={handleAddCase}
				className="w-full mb-3"
			>
				{addingDraftCaseStatus === "loading"
					? "Loading..."
					: "Save As a Draft..."}
			</Button>
			<div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
				<Button
					btnStyle="outline"
					size="lg"
					centralize
					className="text-xs"
					onClick={goBack}
				>
					GO BACK TO CASE MODEL ANSWER SETUP
				</Button>
				<Button btnStyle="basic" size="lg" centralize onClick={goNext}>
					PROCEED TO CME QUESTIONS
				</Button>
			</div>
		</>
	);
};

export default DoctorMaterialsAndDeadline;
