"use client";

import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.mjs";
import { useEffect, useRef } from "react";
import { FunctionComponent } from "react";
import { useAppSelector } from "@/services/hooks/hooks";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

const StudentCertificate: FunctionComponent = () => {
	const navigate = useRouter();
	const submitResponseState = useAppSelector(
		(state) => state.submitCaseResponse
	);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		const renderPdf = async (pdfBase64: string) => {
			if (!pdfBase64 || !canvasRef.current) return;

			try {
				const base64String = pdfBase64.split(",")[2] || pdfBase64.split(",")[1];

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

				const scale = 1.5;
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

		if (submitResponseState?.response?.certificateFile) {
			renderPdf(submitResponseState.response.certificateFile);
		}
	}, [submitResponseState]);

	const handleEndSession = () => navigate.push("/student/dashboard");

	return (
		<>
			<div className="mb-5 sm:mb-6">
				<figure className="w-full" id="pdfCertificate">
					{submitResponseState?.response?.certificateFile ? (
						<canvas ref={canvasRef} className="w-full h-42" />
					) : (
						<p className="text-grey-300 text-1sm text-sm">
							Loading certificate...
						</p>
					)}
				</figure>
			</div>
			<div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
				<Button btnStyle="outline" size="lg" centralize>
					<a
						href={submitResponseState?.response?.certificateUrl}
						target="_blank"
						rel="noopener noreferrer"
					>
						Download Certificate
					</a>
				</Button>
				<Button
					btnStyle="basic"
					size="lg"
					centralize
					onClick={handleEndSession}
				>
					End Session
				</Button>
			</div>
		</>
	);
};

export default StudentCertificate;
