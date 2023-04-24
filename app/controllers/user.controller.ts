/* eslint-disable max-len */
const User = require('../models/user.model');
const Cases = require('../models/cases.model');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');


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


// Cases

exports.getAllCases = (req, res) => {
  console.log(req);
  Cases.find().lean()
      .then((cases) => {
        res.status(200).json({
          status: 'success',
          data: cases,
        });
      })
      .catch((err) => {
        // logger.error(err);
        res.status(400).json({
          status: 'error',
          message: 'Unable to fetch Cases. Please try again. ' + err,
        });
      });
};

exports.getOneCase = (req, res) => {
  Cases.findOne({
    _id: req.params.caseid,
  }).lean()
      .then((cases) => {
        res.status(200).json({
          status: 'success',
          data: cases,
        });
      })
      .catch((err) => {
        // logger.error(err);
        res.status(400).json({
          status: 'error',
          message: 'Unable to fetch case. Please try again ' + err,
        });
      });
};

exports.updateOneTeacherCase = (req, res) => {
  const query = {
    _id: req.params.caseid,
    createdBy: req.userId,
  };
  Cases.findOneAndUpdate(query, req.body, {
    new: true,
  }).lean()
      .then((cases) => {
        res.status(200).json({
          status: 'success',
          data: cases,
        });
      })
      .catch((err) => {
        // logger.error(err);
        res.status(400).json({
          status: 'error ',
          message: 'Unable to update Case data. Please try again ' + err,
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
    _id: req.body.userId,
  }).lean()
      .then((user) => {
        const certname = user.firstname + ' ' + user.lastname;
        Cases.findOne({
          _id: req.body.caseId,
        }).lean()
            .then((cases) => {
              const doc = new PDFDocument({
                layout: 'landscape',
                size: 'A4',
              });
              doc.pipe(fs.createWriteStream(`${certname}.pdf`));
              console.log(cases); const templatepath = (__dirname+'/../resources/static/assets/images/certificate_demo.png');
              doc.image(templatepath, 0, 0, {width: 842});
              doc.fontSize(60).text(certname, 20, 265, {
                align: 'center',
              });
              doc.fontSize(17).text(cases.caseDeadline, -275, 430, {
                align: 'center',
              });
              doc.end();
              res.setHeader('Content-type', 'application/pdf');
              res.download(pdf_file);
              res.status(200).json({
                status: 'success',
              });
            });
      })
      .catch((err) => {
        // logger.error(err);
        res.status(400).json({
          status: 'error',
          message: 'Unable to download certificates for this user. Please try again \n' + err,
        });
      });
};
