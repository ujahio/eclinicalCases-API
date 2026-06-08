import { FC, useEffect, useState } from "react";
import PlateViewer from "@/lib/PlateViewer";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import { getCaseMaterials } from "@/store/slices/case/getCaseMaterialsSlice";
import ProgressButtons from "@/components/progressButtons";

interface StudentCaseTeachingProps {
	goNext: () => void;
	goBack: () => void | undefined;
	caseTeaching: string;
	caseTopic: string;
	caseMaterialsMetaData: {
		fileName: string;
		documentKey: string;
	}[];
}

const StudentCaseTeaching: FC<StudentCaseTeachingProps> = ({
	caseMaterialsMetaData,
	caseTeaching,
	caseTopic,
	goNext,
	goBack,
}) => {
	const dispatch = useAppDispatch();

	const [loading, setLoading] = useState<boolean>(false);
	const [materials, setMaterials] = useState<any[]>([]);

	useEffect(() => {
		const documentKeys = caseMaterialsMetaData?.map(
			(material: any) => material.documentKey,
		);

		const getCaseMaterialsCall = async () => {
			try {
				setLoading(true);

				await dispatch(
					getCaseMaterials({
						fileProcess: "download",
						documentKeys,
					}),
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

	const cachedMaterials = useAppSelector(
		(state) => state.caseMaterials.pdfMaterials,
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
					CASE TEACHING
				</h6>
				<h5 className="font-bold text-base mt-3-75 mb-2.5">{caseTopic}</h5>

				<div className="mb-9 bg-gray-200 p-2.5">
					<PlateViewer jsonString={caseTeaching} />
				</div>
				{loading && <p>Loading...</p>}

				{!loading && materials.length !== 0 && (
					<div className="border-grey-border border rounded-sm p-3 sm:p-6 mb-5 sm:mb-6">
						<h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-2.5">
							TEACHING MATERIALS
						</h6>
						<ul className="flex flex-col w-full space-y-3">
							{materials.map((material: any, index: number) => (
								<li
									key={index}
									className="flex items-center p-2 border-grey-400 border rounded-sm"
								>
									<a
										href={material.pdfUrl}
										download={material.fileName}
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

				<ProgressButtons goNext={goNext} goBack={goBack} />
			</div>
		</>
	);
};

export default StudentCaseTeaching;
