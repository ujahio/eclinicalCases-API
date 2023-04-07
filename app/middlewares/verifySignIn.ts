const { dynamodb } = require('../db/dynamodb.ts');
const Joi = require('joi');

const validateSignInRequest = (req, res, next) => {
  // eslint-disable-next-line max-len
  const regex = new RegExp(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?])[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]{8,30}$/);

  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
      .pattern(regex)
      .required().messages({
        // eslint-disable-next-line max-len
        'string.pattern.base': `Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character and must be between 8 and 30 characters long`,
      }),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  } else {
    next();
  }
};

const verifySignIn = {
  validateSignInRequest,
};

module.exports = verifySignIn;
