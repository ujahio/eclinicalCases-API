/* eslint-disable max-len */
const User = require('../models/user.model');
const Cases = require('../models/cases.model');
const Quizzes = require('../models/quizzes.model');


exports.getTeacher = (req, res) => {
  console.log(req.params);
  User.findOne({
    status: 'active',
    _id: req.params.teacherid,
  }).lean()
      .then((teacher) => {
        delete teacher.password;
        res.status(200).json({
          status: 'success',
          data: teacher,
        });
      })
      .catch((err) => {
        // logger.error(err);
        res.status(400).json({
          status: 'error',
          message: err + ' Unable to find Teacher. Please try again ' + err,
        });
      });
};

exports.updateTeacher = (req, res) => {
  const query = {
    status: 'active',
    _id: req.params.teacherid,
  };
  User.findOneAndUpdate(query, req.body, {
    new: true,
  }).lean()
      .then((teacher) => {
        delete teacher.password;
        res.status(200).json({
          status: 'success',
          data: teacher,
        });
      })
      .catch((err) => {
        // logger.error(err);
        res.status(400).json({
          status: 'error ',
          message: 'Unable to update Teacher data. Please try again ' + err,
        });
      });
};

exports.deleteTeacher = (req, res) => {
  const query = {
    _id: req.params.teacherid,
  };

  User.findOneAndUpdate(query, {
    status: 'inactive',
  }, {
    new: true,
  }).lean()
      .then((teacher) => {
        delete teacher.password;
        res.status(200).json({
          status: 'success',
          data: teacher,
        });
      })
      .catch((err) => {
        // logger.error(err);
        res.status(400).json({
          status: 'error',
          message: 'Unable to remove Teacher. Please try again ' + err,
        });
      });
};


// Quizzes
exports.createQuiz = (req, res) => {
  const quizData = req.body;
  quiz.createdBy = req.teacherId;
  quiz.caseId = req.caseId;
  quiz.createdOn = new Date(Date.now()).toISOString();
  Quizzes.create(quizData)
      .then((quiz) => {
        res.status(201).json({
          status: 'success',
          data: quiz,
        });
      })
      .catch((err) => {
        // logger.error(err);
        res.status(400).json({
          status: 'error ' + err,
          message: 'An error occurred while creating quiz. Please try again ' + err,
        });
      });
};

// Cases
exports.createCase = (req, res) => {
  const caseData = req.body;
  caseData.createdBy = req.userId;
  caseData.createdOn = new Date(Date.now()).toISOString();
  if (req.body.caseDeadline < caseData.createdOn) {
    res.status(400).json({
      status: 'error',
      message: 'Case deadline cannot be in the Past',
    });
  }
  Cases.create(caseData)
      .then((caseCreated) => {
        res.status(201).json({
          status: 'success',
          data: caseCreated,
        });
      })
      .catch((err) => {
        // logger.error(err);
        res.status(400).json({
          status: 'error ' + err,
          message: 'An error occurred while creating case. Please try again ' + err,
        });
      });
};

exports.getAllTeacherCases = (req, res) => {
  console.log(req);
  Cases.find({
    createdBy: req.userId,
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
          message: 'Unable to find any Case. Please try again. ' + err,
        });
      });
};

exports.getOneTeacherCase = (req, res) => {
  Cases.findOne({
    _id: req.params.caseid,
    createdBy: req.userId,
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
          message: 'Unable to load this case. Please try again ' + err,
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
