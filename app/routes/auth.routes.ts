const { verifySignUp, verifySignIn } = require('../middlewares');
const controller = require('../controllers/auth.controller');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });

  app.post(
    '/api/auth/signup',
    [
      verifySignUp.validateSignUpRequest,
      verifySignUp.checkDuplicateEmail,
      verifySignUp.checkDuplicateUsername,
    ],
    controller.signUp,
  );

  app.post('/api/auth/signin', [
    verifySignIn.validateSignInRequest,
  ], controller.signIn);
  // app.post('/api/auth/forgotpassword', controller.forgotpassword);
  // app.get('/api/auth/validate/:token', controller.validatepasswordtoken);
  // app.post('/api/auth/reset/:token', controller.resetpassword);
};
