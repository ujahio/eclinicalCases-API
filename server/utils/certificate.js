// Refactored Lambda Function to Generate Certificate
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import path from "path";
import fs from "fs";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../services/s3Client";
import crypto from "crypto";

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
		const logoPath = path.join(__dirname, "../assets/images/logo.png");
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
			const { width: textWidth } = font.measureText(text, { size });
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
		const uploadPdfToS3 = async (buffer, studentName) => {
			/*
      
        		const deleteParams = {
			Bucket: Resource.CaseMaterials.name,
			Key: fileKey,
		};

		const deleteCommand = new DeleteObjectCommand(deleteParams);
		await s3Client.send(deleteCommand);

      */
			const params = {
				Bucket: Resource.ECCSUsersCertificates.name,
				Key: key,
				Body: buffer,
				ContentType: "application/pdf",
			};

			await s3Client.send(new PutObjectCommand(params));
		};

		await uploadPdfToS3(pdfBytes, studentName);

		return { pdfBuffer: pdfBytes, certificateKey: key };
	} catch (err) {
		console.error("Error generating certificate: ", err);
		throw new Error("Failed to generate certificate");
	}
};

// import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
// import { convert } from "pdf-poppler";
// import fs from "fs";
// import path from "path";
// import SECRETS from "../services/secrets.js";
// console.log("SECRETS", SECRETS);

// export const generateCertificate = async (studentName, caseName) => {
// 	// Generate PDF using pdf-lib
// 	const pdfDoc = await PDFDocument.create();
// 	const page = pdfDoc.addPage([841.89, 595.28]); // A4 landscape
// 	const { width, height } = page.getSize();

// 	// Fonts and styles
// 	const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
// 	const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
// 	const logoPath = path.join(__dirname, "../assets/images", "logo.png");

// 	// const logoUrl = `${SECRETS.NEXT_PUBLIC_BASE_URL}/assets/images/logo.png`; // Replace with your actual domain
// 	// console.log("Fetching logo from:", logoUrl);
// 	// const response = await fetch(logoUrl);

// 	// if (!response.ok) {
// 	// 	throw new Error(`Failed to fetch logo image: ${response.statusText}`);
// 	// }

// 	// const logoBuffer = await response.buffer();

// 	// console.log("logoPath", logoPath);
// 	const logo = await pdfDoc.embedPng(fs.readFileSync(logoPath));
// 	// const logo = await pdfDoc.embedPng(logoBuffer);

// 	const logoDims = logo.scale(0.5);

// 	// Center-align image
// 	page.drawImage(logo, {
// 		x: (width - logoDims.width) / 2,
// 		y: height - logoDims.height - 30,
// 		width: logoDims.width,
// 		height: logoDims.height,
// 	});

// 	// Center-align text
// 	const drawCenteredText = (
// 		text,
// 		size,
// 		font,
// 		yOffset,
// 		color = rgb(0, 0, 0)
// 	) => {
// 		const textWidth = font.widthOfTextAtSize(text, size);
// 		page.drawText(text, {
// 			x: (width - textWidth) / 2,
// 			y: yOffset,
// 			size,
// 			font,
// 			color,
// 		});
// 	};

// 	drawCenteredText("Certificate Of Completion", 25, fontRegular, height - 200);
// 	drawCenteredText("AWARDED TO", 16, fontRegular, height - 300);
// 	drawCenteredText(studentName.toUpperCase(), 30, fontBold, height - 350);
// 	drawCenteredText("WHO SUCCESSFULLY COMPLETED", 16, fontRegular, height - 400);
// 	drawCenteredText(caseName, 25, fontBold, height - 450);
// 	drawCenteredText(
// 		`Date: ${new Date().toLocaleDateString()}`,
// 		15,
// 		fontRegular,
// 		height - 500
// 	);

// 	const pdfBytes = await pdfDoc.save();

// 	// Convert PDF to PNG using pdf-poppler
// 	const tempPdfPath = path.join(__dirname, "../assets/images/certificate.pdf");
// 	const tempPngPath = path.join(__dirname, "../assets/images/certificate.png");
// 	fs.writeFileSync(tempPdfPath, pdfBytes);

// 	const options = {
// 		format: "png",
// 		out_dir: path.dirname(tempPngPath),
// 		out_prefix: path.basename(tempPngPath, path.extname(tempPngPath)),
// 		page: null,
// 	};

// 	await convert(tempPdfPath, options);

// 	const tempPngDeletionPath = path.join(
// 		__dirname,
// 		"../assets/images/certificate-1.png"
// 	);
// 	const pngBuffer = fs.readFileSync(tempPngDeletionPath);

// 	// Cleanup temporary files
// 	fs.unlinkSync(tempPdfPath);
// 	fs.unlinkSync(tempPngDeletionPath);

// 	return { pdfBuffer: pdfBytes, pngBuffer };
// };
