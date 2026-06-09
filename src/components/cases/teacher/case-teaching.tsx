import { FC, useState, ChangeEvent, useRef } from "react";
import { toast } from "react-toastify";
import { InputField } from "@/components/form-elements";
import { Button } from "@/components/uibutton";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import { TeacherCaseTeachingProps } from "@/services/types/teacher/createCaseStudy";
import { getCaseMaterials } from "@/store/slices/case/getCaseMaterialsSlice";
import {
	addPdfToCaseMaterialsApi,
	deletePdfFromCaseMaterialsApi,
} from "@/services/apis/case";
import CaseEditor from "@/lib/Editor";
import ProgressButtons from "@/components/progressButtons";

const TeacherCaseTeaching: FC<TeacherCaseTeachingProps> = ({
	goNext,
	goBack,
	caseStudy,
	setCaseStudy,
	handleUpdateDraftCase,
}) => {
	const dispatch = useAppDispatch();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const addingDraftCaseStatus = useAppSelector(
		(state) => state.getDraftCases.status,
	);

	const [files, setFiles] = useState<
		{
			fileName: string;
			documentKey: string;
		}[]
	>([]);
	const [isUploading, setIsUploading] = useState(false);
	const [isRemoving, setIsRemoving] = useState<string | null>(null);

	const addFile = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click(); // Click the file input to open the dialog
		}
	};

	const removeFile = async (documentKey: string | null = null) => {
		if (!documentKey) return;

		try {
			if (documentKey) {
				setIsRemoving(documentKey);

				await deletePdfFromCaseMaterialsApi(documentKey);
			}
			const updatedFiles = files.filter(
				(file) => file.documentKey !== documentKey,
			);
			setFiles(updatedFiles);
			setCaseStudy({ ...caseStudy, caseMaterials: updatedFiles });
			setIsRemoving(null);
		} catch (error) {
			console.error("Error removing file from S3:", error);
			toast.error("Error deleting file", {
				position: "top-right",
				autoClose: 5000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
				theme: "light",
			});
			setIsRemoving(null);
		}
	};

	const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		const selectedFile = e.target.files && e.target.files[0];

		if (selectedFile) {
			setIsUploading(true);
			try {
				const contentType = selectedFile.type || "application/octet-stream";

				const response = await dispatch(
					getCaseMaterials({
						fileProcess: "upload",
						contentType,
					}),
				);

				if (response.meta.requestStatus !== "fulfilled") {
					throw new Error("Failed to get pre-signed URL");
				}

				const { pdfUrl, documentKey: key } = response.payload;

				await addPdfToCaseMaterialsApi({
					pdfUrl,
					selectedFile,
				});

				const updatedFiles = [
					...files,
					{
						fileName: selectedFile.name,
						documentKey: key,
					},
				];

				setFiles(updatedFiles);

				setCaseStudy({
					...caseStudy,
					caseMaterials: updatedFiles.map((fileInfo) => ({
						fileName: fileInfo.fileName,
						documentKey: fileInfo.documentKey,
					})),
				});
			} catch (error) {
				console.error("Error uploading case materials", error);
				toast.error("Error uploading case materials", {
					position: "top-right",
					autoClose: 5000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
					progress: undefined,
					theme: "light",
				});
			} finally {
				setIsUploading(false);
				if (e.target) {
					e.target.value = "";
				}
			}
		}
	};

	const materials = Array.isArray(caseStudy?.caseMaterials)
		? caseStudy.caseMaterials
		: [];

	const handleEditorChange = (updatedContent: string) => {
		setCaseStudy({
			...caseStudy,
			caseTeaching: updatedContent,
		});
	};

	return (
		<>
			<div className="mb-5 sm:mb-6">
				<h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-4 create-case-heading">
					CASE TEACHING
				</h6>
				<InputField
					placeholder="e.g Malaria"
					label="CASE SUBJECT"
					name="caseTopic"
					value={caseStudy.caseTopic}
					onChange={(e) => {
						e.preventDefault();
						setCaseStudy({ ...caseStudy, caseTopic: e.target.value });
					}}
					className="sm:mb-6 cursor-pointer"
				/>
				<CaseEditor
					content={caseStudy.caseTeaching}
					onContentChange={handleEditorChange}
				/>
			</div>
			<div className="mb-5 sm:mb-6">
				<label className="text-grey-300 text-1sm font-normal create-case-subheading">
					Teaching Materials
				</label>
				<input
					type="file"
					ref={fileInputRef}
					className="hidden"
					accept=".doc,.docx,.pdf,.xls,.xlsx,.ppt,.pptx"
					onChange={handleFileChange}
				/>
				<ul className="mt-3 space-y-2">
					{materials.map((file) =>
						isRemoving === file.documentKey ? (
							<li
								key={file.documentKey}
								className="flex items-center justify-between px-5 py-2 border-grey-border bg-white border text-1xs sm:text-sm create-case-material-item"
							>
								<div className="inline-flex items-center">
									<span className="text-dark">Removing {file.fileName}...</span>
								</div>
							</li>
						) : (
							<li
								key={file.documentKey}
								className="flex items-center justify-between px-5 py-2 border-grey-border bg-white border text-1xs sm:text-sm create-case-material-item"
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
									<span className="text-dark">{file.fileName}</span>
								</div>
								<button
									onClick={() => removeFile(file.documentKey)}
									className="no-outline h-4 w-4"
								>
									<svg width="100%" height="100%" viewBox="0 0 19.799 19.799">
										<g transform="translate(9.899) rotate(45)">
											<path d="M14,8H8v6H6V8H0V6H6V0H8V6h6Z" fill="#394a5d" />
										</g>
									</svg>
								</button>
							</li>
						),
					)}
				</ul>

				{isUploading && (
					<p className="text-1xs sm:text-sm text-grey-300 mt-2">Uploading...</p>
				)}
				{!isUploading && (
					<Button
						variant="secondary"
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
				)}
			</div>
			<Button
				variant="secondary"
				size="md"
				centralize
				onClick={handleUpdateDraftCase}
				className="w-full mb-3 sm:text-sm cursor-pointer"
			>
				{addingDraftCaseStatus === "loading" ? "Loading..." : "SAVE DRAFT"}{" "}
			</Button>
			<ProgressButtons goNext={goNext} goBack={goBack} />
		</>
	);
};

export default TeacherCaseTeaching;
