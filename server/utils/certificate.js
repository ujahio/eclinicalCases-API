// Refactored Lambda Function to Generate Certificate
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import path from "path";
import fs from "fs";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../services/s3Client";
import crypto from "crypto";
import { Resource } from "sst";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const generateCertificate = async (
	studentName,
	caseName,
	submissionDate
) => {
	try {
		// Generate PDF using pdf-lib
		const pdfDoc = await PDFDocument.create();
		const page = pdfDoc.addPage([841.89, 595.28]); // A4 landscape
		const { width, height } = page.getSize();

		// Fonts and styles
		const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
		const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

		// Embed logo using buffer
		const logoPath = path.join(__dirname, "core/src/assets/images/logo.png");
		const logoBuffer = await fs.promises.readFile(logoPath);
		const logo = await pdfDoc.embedPng(logoBuffer);
		const logoDims = logo.scale(0.7);

		// Add black border with white margins
		const borderThickness = 14;
		const margin = 30;
		page.drawRectangle({
			x: margin,
			y: margin,
			width: width - 2 * margin,
			height: height - 2 * margin,
			borderColor: rgb(0, 0, 0),
			borderWidth: borderThickness,
		});

		// Center-align image
		page.drawImage(logo, {
			x: (width - logoDims.width) / 2,
			y: height - logoDims.height - 90,
			width: logoDims.width,
			height: logoDims.height,
		});

		const drawCenteredText = (
			text,
			size,
			font,
			yOffset,
			color = rgb(0, 0, 0),
			maxWidth = null
		) => {
			const words = text.split(" ");
			const lines = [];
			let currentLine = "";

			const pageWidth = page.getWidth(); // Full page width
			const widthLimit = maxWidth || pageWidth;

			// Break text into lines that fit within the width limit
			words.forEach((word) => {
				const testLine = currentLine ? `${currentLine} ${word}` : word;
				const testWidth = font.widthOfTextAtSize(testLine, size);

				if (testWidth <= widthLimit) {
					currentLine = testLine;
				} else {
					lines.push(currentLine);
					currentLine = word;
				}
			});

			// Push the last line if there is any
			if (currentLine) {
				lines.push(currentLine);
			}

			// Calculate the starting Y position for multi-line text
			const lineHeight = size * 1.2; // Adjust line spacing as needed
			const startY = yOffset - ((lines.length - 1) * lineHeight) / 2;

			// Draw each line of text
			lines.forEach((line, index) => {
				const textWidth = font.widthOfTextAtSize(line, size);
				const x = (pageWidth - textWidth) / 2; // Center line on the page width
				const y = startY - index * lineHeight;

				page.drawText(line, {
					x,
					y,
					size,
					font,
					color,
				});
			});
		};

		// Draw certificate text
		drawCenteredText(
			"Certificate Of Completion",
			22,
			fontRegular,
			height - 180
		);
		drawCenteredText("AWARDED TO", 14, fontRegular, height - 220);
		drawCenteredText(studentName.toUpperCase(), 25, fontBold, height - 270);
		drawCenteredText(
			"WHO SUCCESSFULLY COMPLETED",
			14,
			fontRegular,
			height - 330
		);
		drawCenteredText(
			caseName,
			22,
			fontBold,
			height - 360,
			rgb(0, 0, 0),
			650 // Restrict width for this text
		);
		drawCenteredText("1 CME Credit", 14, fontRegular, height - 440);
		drawCenteredText(
			`Date: ${submissionDate.toLocaleDateString("en-US")}`,
			15,
			fontRegular,
			height - 480
		);

		const pdfBytes = await pdfDoc.save();
		const pdfBase64 = Buffer.from(pdfBytes).toString("base64");
		const key = crypto.randomUUID();

		// Upload PDF to S3
		const uploadPdfToS3 = async (buffer) => {
			const params = {
				Bucket: Resource.Certificates.name,
				Key: key,
				Body: buffer,
				ContentType: "application/pdf",
			};

			await s3Client.send(new PutObjectCommand(params));
		};

		await uploadPdfToS3(pdfBytes);

		// Generate a signed URL for the uploaded PDF
		const signedUrl = await getSignedUrl(
			s3Client,
			new GetObjectCommand({
				Bucket: Resource.Certificates.name,
				Key: key,
			}),
			{ expiresIn: 3600 } // URL expires in 1 hour
		);

		return {
			certificateID: key,
			certificateUrl: signedUrl,
			certificateBase64: `data:application/pdf;base64,${pdfBase64}`,
		};
	} catch (err) {
		console.error("Error generating certificate: ", err);
		throw new Error("Failed to generate certificate");
	}
};
