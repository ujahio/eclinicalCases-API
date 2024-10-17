import React, { FC, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import { convertFromRaw, Editor, EditorState } from "draft-js";
import { getUrlToProcessCaseMaterials } from "@/store/slices/case/getUrlToProcessCaseMaterialsSlice";

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

	const [compareMode, setCompareMode] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false); // Loading state
	const [materials, setMaterials] = useState<any[]>([]); // Ensure materials is initialized as an empty array

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

	useEffect(() => {
		// Map document keys from metadata

		const documentKeys = caseMaterialsMetaData?.map(
			(material: any) => material.documentKey
		);

		const fileNames = caseMaterialsMetaData?.map(
			(material: any) => material.fileName // Assuming fileName is stored in caseMaterialsMetaData
		);

		// Fetch materials (signed URLs) from the server
		const getCaseMaterials = async () => {
			try {
				setLoading(true); // Set loading to true when starting the request
				const response = await dispatch(
					getUrlToProcessCaseMaterials({
						fileProcess: "download",
						documentKeys,
						fileNames,
					})
				);

				const signedUrls = response.payload.signedUrls;

				// Update the materials state with the fetched signed URLs
				setMaterials(signedUrls || []); // Ensure materials is always an array
			} catch (error) {
				console.error("Error fetching case materials", error);
			} finally {
				setLoading(false); // Set loading to false after request finishes
			}
		};

		// Only fetch if there are materials to fetch
		if (documentKeys?.length > 0) {
			getCaseMaterials();
		}
	}, [caseMaterialsMetaData]);

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
						<div className="flex items-center justify-between flex-wrap mb-4">
							<h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mr-3.75 mb-2.5">
								YOUR MODEL ANSWER
							</h6>
						</div>
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
					<div className="md:w-45%">
						<div className="flex items-center justify-between flex-wrap mb-4">
							<h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mr-3.75 mb-2.5">
								TEACHER’S MODEL ANSWER
							</h6>
						</div>
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

			<div className="border-grey-border border rounded-sm p-3 sm:p-6 mb-5 sm:mb-6">
				<h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-2.5">
					FURTHER LEARNING MATERIALS
				</h6>

				{loading && (
					<p className="text-1xs sm:text-sm text-grey-300 mt-2">Loading...</p>
				)}

				{!loading && materials.length > 0 && (
					<ul className="flex flex-col w-full space-y-3">
						{materials.map((material: any, index: number) => {
							const { pdfUrl, fileName } = material; // Destructure material to get the necessary fields
							const fileExtension = fileName.split(".").pop()?.toUpperCase(); // Safely get file extension

							return (
								<li
									key={index}
									className="flex items-center p-2 border-grey-400 border rounded-sm"
								>
									<a
										href={pdfUrl} // Use the signed URL to allow file access
										download={fileName} // Set the file to be downloaded with the correct filename
										className="flex items-center"
									>
										<div className="bg-dark p-1.25 text-white font-medium text-xs rounded-sm">
											{fileExtension}
										</div>
										<span className="text-1sm sm:text-sm text-dark inline-block ml-2 sm:ml-2.5">
											{fileName} {/* Display the file name */}
										</span>
									</a>
								</li>
							);
						})}
					</ul>
				)}
			</div>

			{!loading && materials.length === 0 && (
				<p className="text-1xs sm:text-sm text-grey-300 mt-2 mb-5">
					No materials found.
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
				<Button btnStyle="basic" size="lg" centralize onClick={() => goNext()}>
					PROCEED TO THE CME QUESTIONS
				</Button>
			</div>
		</>
	);
};

export default StudentCaseAnswer;
