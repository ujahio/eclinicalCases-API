// Refactored Lambda Function to Generate Certificate
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import path from "path";
import fs from "fs";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../services/s3Client";
import crypto from "crypto";
import { Resource } from "sst";

export const generateCertificate = async (studentName, caseName) => {
	try {
		// Generate PDF using pdf-lib
		const pdfDoc = await PDFDocument.create();
		const page = pdfDoc.addPage([841.89, 595.28]); // A4 landscape
		const { width, height } = page.getSize();

		// Fonts and styles
		const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
		const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

		// Embed logo using buffer
		const logoPath = path.join(__dirname, "../../assets/images/logo.png");
		const logoBuffer = await fs.promises.readFile(logoPath);
		const logo = await pdfDoc.embedPng(logoBuffer);
		const logoDims = logo.scale(0.5);

		// Center-align image
		page.drawImage(logo, {
			x: (width - logoDims.width) / 2,
			y: height - logoDims.height - 30,
			width: logoDims.width,
			height: logoDims.height,
		});

		// Function to draw centered text
		const drawCenteredText = (
			text,
			size,
			font,
			yOffset,
			color = rgb(0, 0, 0)
		) => {
			const textWidth = font.widthOfTextAtSize(text, size);
			page.drawText(text, {
				x: (width - textWidth) / 2,
				y: yOffset,
				size,
				font,
				color,
			});
		};

		// Draw certificate text
		drawCenteredText(
			"Certificate Of Completion",
			25,
			fontRegular,
			height - 200
		);
		drawCenteredText("AWARDED TO", 16, fontRegular, height - 300);
		drawCenteredText(studentName.toUpperCase(), 30, fontBold, height - 350);
		drawCenteredText(
			"WHO SUCCESSFULLY COMPLETED",
			16,
			fontRegular,
			height - 400
		);
		drawCenteredText(caseName, 25, fontBold, height - 450);
		drawCenteredText(
			`Date: ${new Date().toLocaleDateString()}`,
			15,
			fontRegular,
			height - 500
		);

		// Save PDF as a buffer
		const pdfBytes = await pdfDoc.save();
		const key = crypto.randomUUID();

		// Upload PDF to S3
		const uploadPdfToS3 = async (buffer) => {
			const params = {
				Bucket: Resource.ECCSUsersCertificates.name,
				Key: key, // will save the certificate key to another item in the database for future reference
				Body: buffer,
				ContentType: "application/pdf",
			};

			await s3Client.send(new PutObjectCommand(params));
		};

		await uploadPdfToS3(pdfBytes);

		return { pdfBuffer: pdfBytes, certificateID: key };
	} catch (err) {
		console.error("Error generating certificate: ", err);
		throw new Error("Failed to generate certificate");
	}
};
