import { useState, useRef, useEffect } from "react";
import useRenderPdf from "@/services/hooks/useRenderPdf";
import Modal from "@/components/ui/Modal";
import DashboardLayout from "@/components/layouts/dashboard";
import { Button } from "@/components/ui/main-button";

const Certificates = ({
	studentsCertificatesInfo,
}: {
	studentsCertificatesInfo: {
		caseTopicAnswer: string;
		signedUrl: string;
		base64Pdf: string;
		certificateID: string;
	}[];
}) => {
	const [showCertModal, setShowCertModal] = useState(false);
	const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
	const modalCanvasRef = useRef<HTMLCanvasElement | null>(null);
	const { renderPdf } = useRenderPdf();

	const certPopUp = (pdfBase64: string) => {
		setSelectedPdf(pdfBase64);
		setShowCertModal(true);
	};

	useEffect(() => {
		if (selectedPdf && modalCanvasRef.current) {
			renderPdf(selectedPdf, modalCanvasRef);
		}
	}, [selectedPdf, renderPdf]);

	return (
		<DashboardLayout>
			{studentsCertificatesInfo.length > 0 && (
				<>
					<div className="mt-7-5">
						<ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6.25">
							{studentsCertificatesInfo?.map((certificate) => {
								return (
									<li
										className="w-full flex flex-col cursor-pointer"
										key={certificate.certificateID}
									>
										<button
											className="focus:outline-none"
											onClick={() => certPopUp(certificate.base64Pdf)}
										>
											<figure className="w-full mb-2.5">
												<canvas
													ref={(el) => {
														if (el) {
															renderPdf(
																certificate.base64Pdf,
																{ current: el },
																1.0,
															);
														}
													}}
													className="w-full h-42"
												/>
											</figure>
										</button>
										<Button size="sm" centralize variant="outline">
											<a
												href={certificate.signedUrl}
												target="_blank"
												rel="noopener noreferrer"
											>
												Download
											</a>
										</Button>
									</li>
								);
							})}
						</ul>
					</div>
					<Modal show={showCertModal} toggle={setShowCertModal} size="lg">
						<figure className="py-2">
							{selectedPdf && (
								<canvas ref={modalCanvasRef} className="w-full" />
							)}
						</figure>
					</Modal>
				</>
			)}
			{studentsCertificatesInfo.length === 0 && (
				<h3>There are no certificates at the moment.</h3>
			)}
		</DashboardLayout>
	);
};

export default Certificates;
