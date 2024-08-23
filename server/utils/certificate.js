import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { convert } from 'pdf-poppler';
import fs from 'fs';
import path from 'path';

export const generateCertificate = async (studentName, caseName) => {
    // Generate PDF using pdf-lib
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([841.89, 595.28]); // A4 landscape
    const { width, height } = page.getSize();

    // Fonts and styles
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const logoPath = path.join(__dirname, '../assets/images', 'logo.png');
    const logo = await pdfDoc.embedPng(fs.readFileSync(logoPath));
    const logoDims = logo.scale(0.5);

    // Center-align image
    page.drawImage(logo, {
        x: (width - logoDims.width) / 2,
        y: height - logoDims.height - 30,
        width: logoDims.width,
        height: logoDims.height
    });

    // Center-align text
    const drawCenteredText = (text, size, font, yOffset, color = rgb(0, 0, 0)) => {
        const textWidth = font.widthOfTextAtSize(text, size);
        page.drawText(text, {
            x: (width - textWidth) / 2,
            y: yOffset,
            size,
            font,
            color
        });
    };

    drawCenteredText('Certificate Of Completion', 25, fontRegular, height - 200);
    drawCenteredText('AWARDED TO', 16, fontRegular, height - 300);
    drawCenteredText(studentName.toUpperCase(), 30, fontBold, height - 350);
    drawCenteredText('WHO SUCCESSFULLY COMPLETED', 16, fontRegular, height - 400);
    drawCenteredText(caseName, 25, fontBold, height - 450);
    drawCenteredText(`Date: ${new Date().toLocaleDateString()}`, 15, fontRegular, height - 500);

    const pdfBytes = await pdfDoc.save();

    // Convert PDF to PNG using pdf-poppler
    const tempPdfPath = path.join(__dirname, '../assets/images/certificate.pdf');
    const tempPngPath = path.join(__dirname, '../assets/images/certificate.png');
    fs.writeFileSync(tempPdfPath, pdfBytes);

    const options = {
        format: 'png',
        out_dir: path.dirname(tempPngPath),
        out_prefix: path.basename(tempPngPath, path.extname(tempPngPath)),
        page: null
    };

    await convert(tempPdfPath, options);

    const tempPngDeletionPath = path.join(__dirname, '../assets/images/certificate-1.png');
    const pngBuffer = fs.readFileSync(tempPngDeletionPath);

    // Cleanup temporary files
    fs.unlinkSync(tempPdfPath);
    fs.unlinkSync(tempPngDeletionPath);

    return { pdfBuffer: pdfBytes, pngBuffer };
};
