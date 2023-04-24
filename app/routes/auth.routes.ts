import {
  checkDuplicateEmail,
  checkDuplicateUsername,
  validateSignUpRequest,
}
  from '../middlewares/verifySignUp';
import { signIn, signUp } from '../controllers/auth.controller';
import { validateSignInRequest } from '../middlewares/verifySignIn';

export const authRoutes = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });

  app.post(
    '/api/auth/signup',
    [
      validateSignUpRequest,
      checkDuplicateEmail,
      checkDuplicateUsername,
    ],
    signUp,
  );

  app.post('/api/auth/signin', [
    validateSignInRequest,
  ], signIn);

  // app.post('/api/auth/forgotpassword', controller.forgotpassword);
  // app.get('/api/auth/validate/:token', controller.validatepasswordtoken);
  // app.post('/api/auth/reset/:token', controller.resetpassword);
};
