import React, { useState, useRef, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.mjs";
import Modal from "@/components/ui/Modal";
import DashboardLayout from "@/components/layouts/dashboard";
import Button from "../../components/ui/Button";

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

	const certPopUp = (pdfBase64: string) => {
		setSelectedPdf(pdfBase64);
		setShowCertModal(true);
	};

	const renderPdf = async (
		pdfBase64: string,
		canvasRef: React.RefObject<HTMLCanvasElement>,
		scale = 1.0
	) => {
		if (!pdfBase64 || !canvasRef.current) return;

		try {
			const base64String = pdfBase64.split(",")[1];

			if (!base64String) {
				throw new Error("Base64 content not found in the provided data URL.");
			}

			const pdfData = atob(base64String);
			const pdfArray = new Uint8Array(pdfData.length);

			for (let i = 0; i < pdfData.length; i++) {
				pdfArray[i] = pdfData.charCodeAt(i);
			}

			const pdf = await pdfjsLib.getDocument({ data: pdfArray }).promise;
			const page = await pdf.getPage(1);

			const viewport = page.getViewport({ scale });

			const canvas = canvasRef.current;
			const context = canvas.getContext("2d");

			if (!context) {
				throw new Error("Canvas context is not available.");
			}
			canvas.height = viewport.height;
			canvas.width = viewport.width;

			const renderContext = {
				canvasContext: context,
				viewport: viewport,
			};

			await page.render(renderContext).promise;
		} catch (error) {
			console.error("Error rendering PDF:", error);
		}
	};

	useEffect(() => {
		if (selectedPdf && modalCanvasRef.current) {
			renderPdf(selectedPdf, modalCanvasRef);
		}
	}, [selectedPdf]);

	return (
		<DashboardLayout>
			<div className="mt-7.5">
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
														1.0
													);
												}
											}}
											className="w-full h-42"
										/>
									</figure>
								</button>
								<Button size="sm" centralize btnStyle="outline">
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
					{selectedPdf && <canvas ref={modalCanvasRef} className="w-full" />}
				</figure>
			</Modal>
		</DashboardLayout>
	);
};

export default Certificates;
