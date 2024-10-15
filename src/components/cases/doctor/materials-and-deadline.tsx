import React, { useState, ChangeEvent, useRef, useEffect } from "react";
import { InputField } from "@/components/form-elements";
import Button from "@/components/ui/Button";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import { DoctorMaterialsAndDeadlineProps } from "@/services/types/doctor/createCaseStudy";
// import { deleteFileFromS3 } from "../../../../server/services/bucket";
import {
	uploadPdf,
	resetUploadPdfStatus,
} from "@/store/slices/case/uploadPdfSlice";
import { toast } from "react-toastify";

const DoctorMaterialsAndDeadline = ({
	goNext,
	caseStudy,
	setCaseStudy,
	handleAddCase,
}: DoctorMaterialsAndDeadlineProps) => {
	const dispatch = useAppDispatch();

	const [files, setFiles] = useState<{ name: string; s3Url: string }[]>([]);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const addingDraftCaseStatus = useAppSelector(
		(state) => state.getDraftCases.status
	);
	const uploadPdfState = useAppSelector((state) => state.uploadPdf);
	const addFile = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click(); // Click the file input to open the dialog
		}
	};

	// const removeFile = async (index: number) => {
	// 	const fileToRemove = files[index]; // Get the file to remove from the list

	// 	// Remove the file from S3 before removing it from the state
	// 	try {
	// 		// Assuming fileToRemove.s3Url is the pre-signed URL or S3 key
	// 		// const fileKey = fileToRemove.s3Url || fileToRemove.name; // You may store fileKey or use file name as the key

	// 		// Create a function to delete the file from S3
	// 		// await deleteFileFromS3(fileKey);

	// 		// Now remove the file from the state
	// 		const updatedFiles = [...files];
	// 		updatedFiles.splice(index, 1);
	// 		setFiles(updatedFiles);
	// 		setCaseStudy({ ...caseStudy, caseMaterials: updatedFiles }); // Update caseStudy state
	// 	} catch (error) {
	// 		console.error("Error removing file from S3:", error);
	// 	}
	// };

	// const removeFile = (index: number) => {
	// 	const updatedFiles = [...files];
	// 	updatedFiles.splice(index, 1);
	// 	setFiles(updatedFiles);
	// 	setCaseStudy({ ...caseStudy, caseMaterials: updatedFiles }); // Update caseStudy state
	// };

	const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files && e.target.files[0];
		console.log("selectedFile", selectedFile);

		if (selectedFile) {
			console.log("selectedFile", selectedFile);
			dispatch(
				// uploadPdf({ selectedFile: pdfInfo, bucketName: "CaseMaterials" })
				uploadPdf({ selectedFile, bucketName: "CaseMaterials" })
			);

			const updatedFiles = [
				...files,
				{ name: selectedFile.name }, // Capture the file metadata
			];

			setFiles(updatedFiles);
			setCaseStudy({ ...caseStudy, caseMaterials: updatedFiles }); // Update caseStudy state
		}
	};

	// TODO: comment out for now until we figure out proper upload implementation
	// This may not be necessary because the UI will update with files when upload has happend.
	// Just need to confirm when the upload is done.
	// useEffect(() => {
	// 	if (uploadPdfState.status === "succeeded") {
	// 		dispatch(resetUploadPdfStatus());
	// 		// should use the name of the document
	// 		toast.success("Pdf uploaded succesfully", {
	// 			position: "top-right",
	// 			autoClose: 5000,
	// 			hideProgressBar: false,
	// 			closeOnClick: true,
	// 			pauseOnHover: true,
	// 			draggable: true,
	// 			progress: undefined,
	// 			theme: "light",
	// 		});
	// 	} else if (uploadPdfState.status === "failed") {
	// 		toast.error("Error uploading case materials", {
	// 			position: "top-right",
	// 			autoClose: 5000,
	// 			hideProgressBar: false,
	// 			closeOnClick: true,
	// 			pauseOnHover: true,
	// 			draggable: true,
	// 			progress: undefined,
	// 			theme: "light",
	// 		});
	// 	}
	// }, [uploadPdfState.status, dispatch]);

	return (
		<>
			<h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-4">
				Deadline
			</h6>
			{/*TEMP COMMENT OUT UNTIL UPLOADING FILES IS WORKING*/}
			{/* <h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-4">
				Materials and deadline
			</h6>
			<div className="mb-5 sm:mb-6">
				<label className="text-grey-300 text-1sm font-normal">
					Materials for further readings
				</label>
				<input
					type="file"
					ref={fileInputRef}
					className="hidden"
					accept=".doc,.docx,.pdf,.xls,.xlsx,.ppt,.pptx"
					onChange={handleFileChange}
				/>
				<ul className="mt-3 space-y-2">
					{caseStudy.caseMaterials.map((file: any, index: number) => (
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
								onClick={() => removeFile(index)}
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
					: "Save As a Draft..."}{" "}
			</Button>
			<div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
				<Button
					btnStyle="outline"
					size="lg"
					centralize
					className="text-xs"
					onClick={goNext}
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
