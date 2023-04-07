const { dynamodb } = require('../db/dynamodb.ts');
const Joi = require('joi');

const checkDuplicateEmail = async (req, res, next) => {
  const email = req.body.email;
  const params = {
    TableName: 'Users',
    IndexName: 'EmailIndex',
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': { S: email },
    },
  };

  try {
    const data = await dynamodb.query(params).promise();

    if (data.Items.length > 0) {
      console.log('Email already exists');
      res.status(409).send({ message: 'Email already exists' });
      return;
    } else {
      next();
    }
  } catch (err) {
    console.log('Error querying table:', err);
    throw err;
  }
};

const checkDuplicateUsername = async (req, res, next) => {
  const username = req.body.username;
  const params = {
    TableName: 'Users',
    IndexName: 'UsernameIndex',
    KeyConditionExpression: 'username = :username',
    ExpressionAttributeValues: {
      ':username': { S: username },
    },
  };

  try {
    const data = await dynamodb.query(params).promise();

    if (data.Items.length > 0) {
      console.log('Username already exists');
      res.status(409).send({ message: 'Username already exists' });
      return;
    } else {
      next();
    }
  } catch (err) {
    console.log('Error querying table:', err);
    throw err;
  }
};

const validateSignUpRequest = (req, res, next) => {
  // eslint-disable-next-line max-len
  const regex = new RegExp(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?])[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]{8,30}$/);

  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    role: Joi.string().valid('teacher', 'student').required(),
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

const verifySignUp = {
  checkDuplicateEmail,
  checkDuplicateUsername,
  validateSignUpRequest,
};

module.exports = verifySignUp;
