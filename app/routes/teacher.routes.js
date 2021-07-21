/* eslint-disable max-len */
const {authJwt} = require('../middlewares');
const teacherController = require('../controllers/teacher.controller');
cors = require('cors'),

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
        'Access-Control-Allow-Headers',
        'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });


  // Teacher Routes
  app.get('/api/teacher/:teacherid', [authJwt.verifyToken], teacherController.getTeacher);
  app.put('/api/teacher/update/:teacherid', [authJwt.verifyToken], teacherController.updateTeacher);
  app.delete('/api/teacher/delete/:teacherid', [authJwt.verifyToken], teacherController.deleteTeacher);

  // Cases
  app.put('/api/teacher/case/upload', [authJwt.verifyToken], teacherController.uploadPDF);

  app.post('/api/teacher/case/', [authJwt.verifyToken], teacherController.createCase);
  app.get('/api/teacher/case/all', [authJwt.verifyToken], teacherController.getAllTeacherCases);
  app.get('/api/teacher/case/:caseid', [authJwt.verifyToken], teacherController.getOneTeacherCase);

  // Quizzes
  app.post('/api/teacher/questions', [authJwt.verifyToken], teacherController.createQuiz);
  // app.get('/api/teacher/questions', [authJwt.verifyToken], controller.getAllCases);
};

