import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.mjs";

const useRenderPdf = () => {
	const renderPdf = async (
		pdfBase64: string,
		canvasRef: React.RefObject<HTMLCanvasElement>,
		scale = 1.0
	) => {
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

	return { renderPdf };
};

export default useRenderPdf;
