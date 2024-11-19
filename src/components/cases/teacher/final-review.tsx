import React, { FunctionComponent, Fragment } from "react";
import Cme from "./cme";
import Button from "@/components/ui/Button";
import { convertFromRaw, Editor, EditorState } from "draft-js";
import { useAppSelector } from "@/services/hooks/hooks";
import { FinalReviewProps } from "@/services/types/teacher/createCaseStudy";

const FinalReview: FunctionComponent<FinalReviewProps> = ({
	caseStudy,
	handleUpdateDraftCase,
	handlePublishCase,
}) => {
	const parseEditorState = (data: string) => {
		try {
			return EditorState.createWithContent(convertFromRaw(JSON.parse(data)));
		} catch (error) {
			console.error("Error parsing editor state:", error);
			return EditorState.createEmpty();
		}
	};

	const caseDescription = parseEditorState(caseStudy.caseDescription || "{}");
	const caseExplanation = parseEditorState(caseStudy.caseExplanation || "{}");
	const caseTeaching = parseEditorState(caseStudy.caseTeaching || "{}");

	const addingDraftCaseStatus = useAppSelector(
		(state) => state.getDraftCases.status
	);

	const addCaseStatus = useAppSelector((state) => state.addCase.status);
	const publishedCaseInfo = useAppSelector((state) => state.activeCase.data);

	return (
		<>
			<div className=" border-b-0.375">
				<h3 className="uppercase font-bold text-sm text-blue mb-2">
					Case Model Topic Description
				</h3>
				<div className="mb-9 bg-gray-200 p-2.5">
					<Editor
						editorState={caseDescription}
						readOnly={true}
						onChange={() => {}}
					/>
				</div>
			</div>
			<div className=" border-b-0.375">
				<h3 className="uppercase font-bold text-sm text-blue mb-2 mt-10">
					CASE MODEL ANSWER
				</h3>
				<div className="mb-9 bg-gray-200 p-2.5">
					<Editor
						editorState={caseExplanation}
						readOnly={true}
						onChange={() => {}}
					/>
				</div>

				<h3 className="uppercase font-bold text-sm text-blue mb-2">DEADLINE</h3>
				<p className="mb-9">{caseStudy.caseDeadline}</p>
			</div>
			<div className="border-b-0.375">
				<h3 className="uppercase font-bold text-sm text-blue mb-2 mt-10">
					Case Subject
				</h3>
				<p className="mb-9">{caseStudy.caseTopic}</p>
				<h3 className="uppercase font-bold text-sm text-blue mb-2 mt-10">
					Case Teaching
				</h3>
				<div className="mb-9 bg-gray-200 p-2.5">
					<Editor
						editorState={caseTeaching}
						readOnly={true}
						onChange={() => {}}
					/>
				</div>
				<h3 className="uppercase font-bold text-sm text-blue mb-4">
					TEACHING MATERIALS
				</h3>
				<ul className="flex flex-col w-full space-y-3 mb-9">
					{caseStudy.caseMaterials?.map((material: any, index: number) => (
						<li key={material.documentKey}>
							<div className="flex items-center p-2 border-grey-400 border rounded-sm">
								<span className="text-1sm sm:text-sm text-dark inline-block ml-2 sm:ml-2.5">
									{material.fileName}
								</span>
							</div>
						</li>
					))}
				</ul>
			</div>

			<div>
				<h3 className="uppercase font-bold text-sm text-blue mb-4 mt-10">
					CME QUESTIONS
				</h3>
				<Cme questions={caseStudy.caseQuestions} />
			</div>
			<div
				className={`grid ${
					!publishedCaseInfo ? "sm:grid-cols-2" : ""
				} grid-cols-1 gap-4`}
			>
				<Button
					btnStyle="outline"
					size="lg"
					centralize
					onClick={handleUpdateDraftCase}
				>
					{addingDraftCaseStatus === "loading"
						? "Loading..."
						: "Save As a Draft..."}
				</Button>
				{!publishedCaseInfo && (
					<Button
						size="lg"
						onClick={handlePublishCase}
						disabled={!!publishedCaseInfo}
					>
						{addCaseStatus === "loading"
							? "Loading..."
							: "POST TO ALL STUDENTS"}
					</Button>
				)}
			</div>
			{/* <div className={`grid grid-cols-1 gap-4`}>
				{!publishedCaseInfo && (
					<Button
						size="lg"
						onClick={handlePublishCase}
						disabled={!!publishedCaseInfo}
						centralize
					>
						{addCaseStatus === "loading"
							? "Loading..."
							: "POST TO ALL STUDENTS"}
					</Button>
				)}
			</div> */}
		</>
	);
};

export default FinalReview;
