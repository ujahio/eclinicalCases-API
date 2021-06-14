/* eslint-disable valid-jsdoc */
/* eslint-disable no-unused-vars */
/* eslint-disable require-jsdoc */
const PDFDocument = require('pdfkit');
const getStream = require('get-stream');
const fs = require('fs');


class PdfKitService {
  /**
   * Generate a PDF of the letter
   *
   * @return {Buffer}
   */
  async generatePdf(filename) {
    try {
      const doc = new PDFDocument();

      doc.fontSize(25).text('Some text with an embedded font!', 100, 100);

      // if (process.env.NODE_ENV === 'development') {
      //   doc.pipe(fs.createWriteStream(`${__dirname}/../file.pdf`));
      // }

      doc.end();

      const pdfStream = await getStream.buffer(doc);

      return pdfStream;
    } catch (error) {
      return null;
    }
  }
}
