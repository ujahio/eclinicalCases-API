/* eslint-disable max-len */
const {authJwt} = require('../middlewares');
const controller = require('../controllers/user.controller');

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
        'Access-Control-Allow-Headers',
        'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });

  // app.get('/api/test/all', controller.allAccess);

  // User Routes
  app.get('/api/user/:userid', [authJwt.verifyToken], controller.getUser);
  app.put('/api/user/update/:userid', [authJwt.verifyToken], controller.updateUser);
  app.delete('/api/user/delete/:userid', [authJwt.verifyToken], controller.deleteUser);

  // User Certificates
  app.get('/api/user/cert/all', [authJwt.verifyToken], controller.getAllUserCert);
  app.get('/api/user/cert/:caseid', [authJwt.verifyToken], controller.getOneUserCert);


  // app.get(
  //     '/api/test/mod',
  //     [authJwt.verifyToken, authJwt.isModerator],
  //     controller.moderatorBoard,
  // );

  // app.get(
  //     '/api/test/admin',
  //     [authJwt.verifyToken, authJwt.isAdmin],
  //     controller.adminBoard,
  // );
};
