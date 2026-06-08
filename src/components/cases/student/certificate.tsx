"use client";

import { useEffect, useRef } from "react";
import { FC } from "react";
import { useAppSelector } from "@/services/hooks/hooks";
import useRenderPdf from "@/services/hooks/useRenderPdf";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

const StudentCertificate: FC = () => {
	const navigate = useRouter();
	const submitResponseState = useAppSelector(
		(state) => state.submitCaseResponse,
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
						<canvas ref={canvasRef} className="w-full h-auto" />
					) : (
						<p className="text-grey-300 text-1sm text-sm">
							Loading certificate...
						</p>
					)}
				</figure>
			</div>
			<div className="create-case-actions grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
				<Button
					btnStyle="outline"
					className="w-full flex items-center justify-center gap-2 sm:text-sm cursor-pointer"
					centralize
				>
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
					className="w-full flex items-center justify-center gap-2 sm:text-sm cursor-pointer"
					centralize
					onClick={handleEndSession}
				>
					<span>end</span>
				</Button>
			</div>
		</>
	);
};

export default StudentCertificate;
