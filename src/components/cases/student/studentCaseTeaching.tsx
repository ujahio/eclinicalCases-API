import React, { FunctionComponent, useEffect, useState } from "react";
import { Editor, convertFromRaw, EditorState } from "draft-js";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import { getCaseMaterials } from "@/store/slices/case/getCaseMaterialsSlice";
import { RootState } from "@/store/rootReducer/rootReducer";
import Button from "@/components/ui/Button";

interface StudentCaseTeachingProps {
	goNext: () => void;
	goBack: () => void;
	caseTeaching: string;
	caseTopic: string;
	caseMaterialsMetaData: {
		fileName: string;
		documentKey: string;
	}[];
}

const fallbackContent = JSON.stringify({
	blocks: [],
	entityMap: {},
});

const StudentCaseTeaching: FunctionComponent<StudentCaseTeachingProps> = ({
	caseMaterialsMetaData,
	caseTeaching,
	caseTopic,
	goNext,
	goBack,
}) => {
	const caseTeachingContent = EditorState.createWithContent(
		convertFromRaw(JSON.parse(caseTeaching || fallbackContent))
	);
	const dispatch = useAppDispatch();

	const [loading, setLoading] = useState<boolean>(false);
	const [materials, setMaterials] = useState<any[]>([]); // State for combined materials

	// Fetching the materials
	useEffect(() => {
		const documentKeys = caseMaterialsMetaData?.map(
			(material: any) => material.documentKey
		);

		const getCaseMaterialsCall = async () => {
			try {
				setLoading(true);

				await dispatch(
					getCaseMaterials({
						fileProcess: "download",
						documentKeys,
					})
				);
			} catch (error) {
				console.error("Error fetching case materials", error);
			} finally {
				setLoading(false);
			}
		};

		if (caseMaterialsMetaData.length > 0) {
			getCaseMaterialsCall();
		}
	}, [caseMaterialsMetaData, dispatch]);

	// Select cached materials from Redux store
	const cachedMaterials = useAppSelector(
		(state: RootState) => state.caseMaterials.pdfMaterials
	);

	useEffect(() => {
		const caseMaterials = caseMaterialsMetaData.map((itemA) => {
			const uploadedItem = cachedMaterials[itemA.documentKey];
			return {
				...itemA,
				pdfUrl: uploadedItem ? uploadedItem.pdfUrl : null,
			};
		});

		setMaterials(caseMaterials);
	}, [cachedMaterials, caseMaterialsMetaData]);
	return (
		<>
			<div className="mb-5 sm:mb-6">
				<h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-2.5">
					CASE TOPIC
				</h6>
				<h5 className="font-bold text-base mt-3.75 mb-2.5">{caseTopic}</h5>

				<div className="mb-9 bg-gray-200 p-2.5">
					<Editor
						editorState={caseTeachingContent}
						readOnly={true}
						onChange={() => {}}
					/>
				</div>
				{loading && <p>Loading...</p>}

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
										target="_blank"
										rel="noopener noreferrer"
									>
										<div className="bg-dark p-1.25 text-white font-medium text-xs rounded-sm">
											{material.fileName.split(".").pop()?.toUpperCase() ||
												"PDF"}
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

				<div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
					<Button
						btnStyle="outline"
						size="lg"
						centralize
						onClick={() => goBack()}
					>
						BACK TO CASE MODEL ANSWERS
					</Button>
					<Button
						disabled={loading}
						btnStyle="basic"
						size="lg"
						centralize
						onClick={() => goNext()}
					>
						PROCEED TO CME QUESTIONS
					</Button>
				</div>
			</div>
		</>
	);
};

export default StudentCaseTeaching;
