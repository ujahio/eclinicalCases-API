"use client";

import { useEffect, useRef } from "react";
import { FunctionComponent } from "react";
import { useAppSelector } from "@/services/hooks/hooks";
import useRenderPdf from "@/services/hooks/useRenderPdf";
import Button from "@/components/ui-custom/button";
import { useRouter } from "next/navigation";

const StudentCertificate: FunctionComponent = () => {
	const navigate = useRouter();
	const submitResponseState = useAppSelector(
		(state) => state.submitCaseResponse
	);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const { renderPdf } = useRenderPdf();

	useEffect(() => {
		if (submitResponseState?.response?.certificateFile) {
			renderPdf(submitResponseState.response.certificateFile, canvasRef);
		}
	}, [submitResponseState, renderPdf, canvasRef]);

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
