/* eslint-disable max-len */
const User = require('../models/user.model');
const Cases = require('../models/cases.model');
const PDFDocument = require('pdfkit');


exports.getUser = (req, res) => {
  User.findOne({
    status: 'active',
    _id: req.params.userid,
  }).lean()
      .then((user) => {
        delete user.password;
        res.status(200).json({
          status: 'success',
          data: user,
        });
      })
      .catch((err) => {
        // logger.error(err);
        res.status(400).json({
          status: 'error',
          message: 'Unable to find User. Please try again',
        });
      });
};

exports.updateUser = (req, res) => {
  const query = {
    status: 'active',
    _id: req.params.userid,
  };
  User.findOneAndUpdate(query, req.body, {
    new: true,
  }).lean()
      .then((user) => {
        delete user.password;
        res.status(200).json({
          status: 'success',
          data: user,
        });
      })
      .catch((err) => {
        // logger.error(err);
        res.status(400).json({
          status: 'error ' + err,
          message: 'Unable to update user. Please try again',
        });
      });
};

exports.deleteUser = (req, res) => {
  const query = {
    _id: req.params.userid,
  };

  User.findOneAndUpdate(query, {
    status: 'inactive',
  }, {
    new: true,
  }).lean()
      .then((user) => {
        delete user.password;
        res.status(200).json({
          status: 'success',
          data: user,
        });
      })
      .catch((err) => {
        // logger.error(err);
        res.status(400).json({
          status: 'error',
          message: 'Unable to remove user. Please try again',
        });
      });
};


// certificates
exports.getAllUserCert = (req, res) => {
  console.log(req);
  User.findOne({
    status: 'active',
    _id: req.userId,
  }).lean()
      .then((user) => {
        delete user.password;
        res.status(200).json({
          status: 'success',
          data: user.cases_passed,
        });
      })
      .catch((err) => {
        // logger.error(err);
        res.status(400).json({
          status: 'error',
          message: 'Unable to find User. Please try again ' + err,
        });
      });
};

exports.getOneUserCert = (req, res) => {
  User.findOne({
    status: 'active',
    _id: req.userId,
  }).lean()
      .then((user) => {
        Cases.findOne({
          _id: req.params.caseid,
        }).lean()
            .then((cases) => {
              res.status(200).json({
                status: 'success',
                data: cases,
              });
            });
      })
      .catch((err) => {
        // logger.error(err);
        res.status(400).json({
          status: 'error',
          message: 'Unable to load certificates for this user. Please try again',
        });
      });
};


exports.downloadUserCert = (req, res) => {
  User.findOne({
    status: 'active',
    _id: req.userId,
  }).lean()
      .then((user) => {
        Cases.findOne({
          _id: req.params.caseid,
        }).lean()
            .then((cases) => {
              const PDFDoc = new PDFDocument({layout: 'landscape'} );
              res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Access-Control-Allow-Origin': '*',
              });
              console.log(__dirname);
              PDFDoc.info['Title'] = user.name+ ' - Certificate of Completion - ' + cases.caseTopic;
              PDFDoc.pipe(res);
              PDFDoc
                  .fontSize(25)
                  .moveDown(0.5)
                  .text('Scaled to fit width and height')
                  .image(__dirname+'/../resources/static/assets/images/ecclogo.png', {width: 150, height: 150})
                  .text('Some text with an embedded font!', 100, 100)
                  .text('This text is left aligned', {align: 'left'})
                  .text('This text is at the center', {align: 'center'})
                  .text('This text is right aligned', {align: 'right'})
                  .text('This text needs to be slightly longer so that we can see that justification actually works as intended', {align: 'justify'});
              // Finalize PDF file
              PDFDoc.end();
            });
      })
      .catch((err) => {
        // logger.error(err);
        res.status(400).json({
          status: 'error',
          message: 'Unable to load certificates for this user. Please try again',
        });
      });
};
