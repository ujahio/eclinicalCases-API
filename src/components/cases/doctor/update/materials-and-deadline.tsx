import { InputField } from "@/components/form-elements";
import Button from "@/components/ui/Button";
import React, {
	FunctionComponent,
	ChangeEvent,
	useRef,
	useState,
	useEffect,
} from "react";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import {
	addPdfToCaseMaterialsApi,
	deletePdfFromCaseMaterialsApi,
} from "@/services/apis/case";
import { toast } from "react-toastify";
import { getCaseMaterials } from "@/store/slices/case/getCaseMaterialsSlice";
import { getTokenForRequest } from "@/utils/getTokenForRequest";

interface DoctorMaterialsAndDeadlineProps {
	goNext: () => void;
	goBack: () => void;
	caseStudy: any;
	setCaseStudy: React.Dispatch<React.SetStateAction<any>>;
	handleUpdateDraftCase: React.Dispatch<React.SetStateAction<any>>;
	caseMaterials: { fileName: string; documentKey: string }[];
	caseDeadline: string;
}

const DoctorMaterialsAndDeadline: FunctionComponent<
	DoctorMaterialsAndDeadlineProps
> = ({
	goNext,
	goBack,
	caseStudy,
	setCaseStudy,
	handleUpdateDraftCase,
	caseMaterials,
	caseDeadline,
}) => {
	const [loading, setLoading] = useState<boolean>(false);
	const [isRemoving, setIsRemoving] = useState<string | null>(null);
	const [materials, setMaterials] = useState<
		{
			fileName: string;
			documentKey: string;
		}[]
	>([]);

	const addingDraftCaseStatus = useAppSelector(
		(state) => state.getDraftCases.status
	);
	const dispatch = useAppDispatch();

	const fileInputRef = useRef<HTMLInputElement>(null);

	const addFile = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const removeFile = async (documentKey: string | null = null) => {
		const userToken = await getTokenForRequest();

		if (!documentKey) return;

		try {
			setIsRemoving(documentKey);
			await deletePdfFromCaseMaterialsApi(documentKey, userToken);

			// Immediately update the UI and state
			const updatedFiles = materials.filter(
				(file) => file.documentKey !== documentKey
			);
			setMaterials(updatedFiles);
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
		const selectedFile = e.target.files && e.target.files[0];
		if (selectedFile) {
			setLoading(true);
			const response = await dispatch(
				getCaseMaterials({
					fileProcess: "upload",
				})
			);
			const { pdfUrl, documentKey } = response.payload;

			const updatedFiles = [
				...materials,
				{
					fileName: selectedFile.name,
					documentKey,
				},
			];

			setMaterials(updatedFiles);

			try {
				await addPdfToCaseMaterialsApi({
					pdfUrl,
					selectedFile,
				});
			} catch (error) {
				removeFile(documentKey);

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
				setLoading(false);
			}

			// Update caseStudy with new files
			setCaseStudy({
				...caseStudy,
				caseMaterials: [...materials, ...updatedFiles].map((fileInfo) => ({
					fileName: fileInfo.fileName,
					documentKey: fileInfo.documentKey,
				})),
			});
		}
	};

	useEffect(() => {
		if (caseMaterials?.length > 0 && materials.length === 0) {
			setMaterials(caseMaterials); // Populate the materials state with the previous uploads
		}
	}, [caseMaterials, materials]);

	return (
		<>
			<h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-4">
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
					multiple
				/>
				<ul className="mt-3 space-y-2">
					{materials.map((file, index) => (
						<li
							key={`${index}-file.documentKey`}
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
					))}
				</ul>

				{loading && (
					<p className="text-1xs sm:text-sm text-grey-300 mt-2">Uploading...</p>
				)}
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
			</div>
			<div className="mb-5 sm:mb-6">
				<InputField
					placeholder=""
					label="Select a deadline for this case study"
					name="caseDeadline"
					type="date"
					value={caseDeadline}
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
				onClick={handleUpdateDraftCase}
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
