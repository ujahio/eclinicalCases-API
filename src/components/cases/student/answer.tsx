import React, { FC, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import { convertFromRaw, Editor, EditorState } from "draft-js";
import { getCaseMaterials } from "@/store/slices/case/getCaseMaterialsSlice";
import { useSelector } from "react-redux";
import { RootState } from "@/store/rootReducer/rootReducer";

interface StudentCaseAnswerProps {
	goNext: () => void;
	goBack: () => void;
	caseTopic: string;
	caseExplanation: any;
	studentCaseExplanation: string;
	studentCaseTopicResponse: string;
	caseMaterialsMetaData: {
		fileName: string;
		documentKey: string;
	}[];
}

const StudentCaseAnswer: FC<StudentCaseAnswerProps> = ({
	goNext,
	goBack,
	caseTopic,
	caseExplanation,
	studentCaseExplanation,
	studentCaseTopicResponse,
	caseMaterialsMetaData,
}) => {
	const dispatch = useAppDispatch();
	const currentTime = Date.now(); // Get the current timestamp

	const [compareMode, setCompareMode] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [materials, setMaterials] = useState<any[]>([]); // State for combined materials

	const teacherCaseStudyExplanationRawContent = caseExplanation
		? JSON.parse(caseExplanation)
		: { blocks: [], entityMap: {} };
	const studentCaseResponseRawContent = studentCaseExplanation
		? JSON.parse(studentCaseExplanation)
		: { blocks: [], entityMap: {} };

	const teacherCaseDescription = EditorState.createWithContent(
		convertFromRaw(teacherCaseStudyExplanationRawContent)
	);
	const studentCaseExplanationContent = EditorState.createWithContent(
		convertFromRaw(studentCaseResponseRawContent)
	);

	// Select cached materials from Redux store
	const cachedMaterials = useSelector(
		(state: RootState) => state.caseMaterials.pdfMaterials
	);

	// Fetching the materials
	useEffect(() => {
		const documentKeys = caseMaterialsMetaData?.map(
			(material: any) => material.documentKey
		);

		// Identify keys that need fetching (either not cached or expired)
		const uncachedKeys = documentKeys.filter(
			(key) =>
				!cachedMaterials[key] ||
				cachedMaterials[key].expiryTimestamp <= currentTime
		);

		const getCaseMaterialsCall = async () => {
			try {
				setLoading(true);

				// If there are uncached or expired keys, fetch them
				if (uncachedKeys.length > 0) {
					await dispatch(
						getCaseMaterials({
							fileProcess: "download",
							documentKeys: uncachedKeys,
						})
					);
				}
			} catch (error) {
				console.error("Error fetching case materials", error);
			} finally {
				setLoading(false);
			}
		};

		// Only fetch if there are uncached or expired keys
		if (uncachedKeys.length > 0) {
			getCaseMaterialsCall();
		}
	}, [caseMaterialsMetaData, dispatch, cachedMaterials, currentTime]);

	// Use useEffect to set materials only after loading completes
	useEffect(() => {
		if (!loading) {
			// Combine cached and newly fetched materials
			const updatedMaterials = caseMaterialsMetaData.map((material: any) => {
				const cachedMaterial = cachedMaterials[material.documentKey];
				return cachedMaterial && cachedMaterial.expiryTimestamp > currentTime
					? { ...material, pdfUrl: cachedMaterial.pdfUrl } // Use cached URL if still valid
					: material; // Otherwise, use metadata without the URL (it may still be loading)
			});
			setMaterials(updatedMaterials);
		}
	}, [loading, caseMaterialsMetaData, cachedMaterials, currentTime]);

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

			{/* Conditional rendering based on compareMode */}
			{!compareMode && (
				<div className="mb-5 sm:mb-6">
					<h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mr-3.75 mb-2.5">
						TEACHER’S MODEL ANSWER
					</h6>
					<h6 className="text-1xs sm:text-sm font-medium text-grey-300 uppercase mb-2.5">
						{caseTopic}
					</h6>
					<div className="text-dark sm:text-base text-1sm">
						<div className="mb-9 bg-gray-200 p-2.5">
							<Editor
								editorState={teacherCaseDescription}
								readOnly={true}
								onChange={() => {}}
							/>
						</div>
					</div>
				</div>
			)}

			{compareMode && (
				<div className="flex flex-col md:justify-between md:flex-row">
					<div className="md:w-45%">
						<h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-2.5">
							YOUR MODEL ANSWER
						</h6>
						<div className="mb-5 sm:mb-6">
							<h6 className="text-1xs sm:text-sm font-medium text-grey-300 uppercase mb-2.5">
								{studentCaseTopicResponse}
							</h6>
							<div className="text-dark sm:text-base text-1sm">
								<div className="mb-9 bg-gray-200 p-2.5">
									<Editor
										editorState={studentCaseExplanationContent}
										readOnly={true}
										onChange={() => {}}
									/>
								</div>
							</div>
						</div>
					</div>

					{/* Teacher's model answer */}
					<div className="md:w-45%">
						<h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-2.5">
							TEACHER’S MODEL ANSWER
						</h6>
						<div className="mb-5 sm:mb-6">
							<h6 className="text-1xs sm:text-sm font-medium text-grey-300 uppercase mb-2.5">
								{caseTopic}
							</h6>
							<div className="text-dark sm:text-base text-1sm">
								<div className="mb-9 bg-gray-200 p-2.5">
									<Editor
										editorState={teacherCaseDescription}
										readOnly={true}
										onChange={() => {}}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{loading && <p>Loading...</p>}

			{/* Render materials */}
			{!loading && materials.length !== 0 && (
				<div className="border-grey-border border rounded-sm p-3 sm:p-6 mb-5 sm:mb-6">
					<h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-2.5">
						FURTHER LEARNING MATERIALS
					</h6>
					<ul className="flex flex-col w-full space-y-3">
						{materials.map((material: any, index: number) => (
							<li
								key={index}
								className="flex items-center p-2 border-grey-400 border rounded-sm"
							>
								<a
									href={material.pdfUrl} // Use the signed URL for downloading
									download={material.fileName} // Use the fileName for download
									className="flex items-center"
								>
									<div className="bg-dark p-1.25 text-white font-medium text-xs rounded-sm">
										{material.fileName.split(".").pop()?.toUpperCase() || "PDF"}
									</div>
									<span className="text-1sm sm:text-sm text-dark inline-block ml-2 sm:ml-2.5">
										{material.fileName}
									</span>
								</a>
							</li>
						))}
					</ul>
				</div>
			)}

			{!loading && materials.length === 0 && (
				<p className="text-1xs sm:text-sm text-grey-300 mt-2 mb-5">
					There are no further learning materials available.
				</p>
			)}

			<div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
				<Button
					btnStyle="outline"
					size="lg"
					centralize
					onClick={() => goBack()}
				>
					BACK TO CASE MODEL QUESTIONS
				</Button>
				<Button
					disabled={loading}
					btnStyle="basic"
					size="lg"
					centralize
					onClick={() => goNext()}
				>
					PROCEED TO THE CME QUESTIONS
				</Button>
			</div>
		</>
	);
};

export default StudentCaseAnswer;
