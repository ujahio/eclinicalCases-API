const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');


exports.generateCertificate = (studentName, caseName, outputPath) => {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    doc.pipe(fs.createWriteStream(outputPath));

    // Fonts
    const fontRegular = path.join(__dirname, '../assets/fonts', 'OpenSans-Regular.ttf');
    const fontBold = path.join(__dirname, '../assets/fonts', 'OpenSans-Bold.ttf');
    // Add logo
    const logoPath = path.join(__dirname, '../assets/images', 'logo.png');
    const logoWidth = 120;
    const logoHeight = 30;

    doc.image(logoPath, (doc.page.width / 2) - (logoWidth / 2), 30, { width: logoWidth, height: logoHeight });
    doc.moveDown(2).fontSize(25).font(fontRegular).fillColor('#000000').text('Certificate Of Completion', { align: 'center' }).moveDown(2);
    doc.fillOpacity(0.5);
    doc.fontSize(16).text('AWARDED TO', { align: 'center' }).moveDown(1);
    doc.fillOpacity(1);
    doc.fontSize(30).font(fontBold).text(studentName.toUpperCase(), { align: 'center' }).moveDown(1);
    doc.fillOpacity(0.5);
    doc.fontSize(16).font(fontRegular).text('WHO SUCCESSFULLY COMPLETED', { align: 'center' }).moveDown(1);
    doc.fillOpacity(1);
    doc.fontSize(25).font(fontBold).text(caseName, { align: 'center' }).moveDown(1);
    doc.fillOpacity(0.5);
    doc.fontSize(16).font(fontRegular).text('7 CREDITS', { align: 'center' }).moveDown(1);
    doc.fontSize(15).text(`Date: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.end();
};
