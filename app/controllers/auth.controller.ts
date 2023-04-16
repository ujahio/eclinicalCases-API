/* eslint-disable no-multi-str */
/* eslint-disable max-len */
/* eslint-disable valid-jsdoc */
import { dynamodb } from '../db/dynamodb';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const signUp = async (req, res) => {
  const { email, username, password, role } = req.body;

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const params = {
    Item: {
      id: { S: uuidv4() },
      email: { S: email },
      username: { S: username },
      password: { S: hashedPassword },
      role: { S: role },
    },
    TableName: 'Users',
  };

  try {
    await dynamodb.putItem(params).promise();
    res.status(201).send({ message: 'User registered' });
  } catch (err) {
    console.log('Error inserting data:', err);
    res.status(500).send({ message: 'Internal server error' });
  }
};

export const signIn = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Define the parameters for the DynamoDB query operation
  const params = {
    TableName: 'Users',
    IndexName: 'EmailIndex',
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': { S: email },
    },
  };

  // Query the table to check if the user exists
  dynamodb.query(params, async (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    // Check if the response contains any data
    if (data && data.Items && data.Items.length > 0) {
      // User exists
      const user = data.Items[0];
      const hash = user.password.S;

      // Compare the password hash to the input password
      const match = await bcrypt.compare(password, hash);

      if (match) {
        // Password is correct

        // Generate the JWT token
        const payload = { email: email };
        const options = { expiresIn: '1h' }; // Set the token expiry time
        const token = jwt.sign(payload, process.env.JWT_KEY, options);

        res.status(200).json({ token: token }); // Send the token back to the client
      } else {
        // Password is incorrect
        res.status(401).json({ error: 'Invalid email or password' });
      }
    } else {
      // User does not exist
      res.status(401).json({ error: 'Invalid email or password' });
    }
  });
};

// /**
//  * Implement a way to recover user accounts
//  */
// exports.forgotpassword = (req, res) => {
//   const email = req.body.email;
//   User.findOne({email: email})
//       .then((user) => {
//         if (!user) {
//           return res.status(401).json({
//             message: 'The email address ' + email + ' is not associated with any account. Double-check your email address and try again.',
//           });
//         }

//         const resetPasswordToken = crypto.randomBytes(20).toString('hex');
//         const resetPasswordExpires = Date.now() + 3600000; // expires in an hour

//         User.updateOne({email: req.body.email}, {resetPasswordToken: resetPasswordToken, resetPasswordExpires: resetPasswordExpires}, (err) => {
//           if (err) return res.status(500).json({message: err.message});
//         });
//         const link = 'http://' + req.headers.host + '/api/auth/validate/' + resetPasswordToken;
//         const mailOptions = {
//           from: 'israelolakanmi@yahoo.com',
//           to: email,
//           subject: 'Password Reset Request',
//           text: `Hi ${email} \n
// Please click on the following link ${link} to reset your password. \n\n
// If you did not request this, please ignore this email and your password will remain unchanged.\n`,
//         };
//         transporter.sendMail(mailOptions, function(error, info) {
//           if (error) {
//             return res.status(500).json({message: error.message});
//           } else {
//             res.status(201).json({
//               status: 'success',
//               data: 'A reset email has been sent to ' + email + '.',
//             });
//           }
//         });
//       });
// };

// /**
//  * Validate password reset token
//  */
// exports.validatepasswordtoken = (req, res) => {
//   User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}})
//       .then((user) => {
//         if (!user) return res.status(401).json({message: 'Password reset token is invalid or has expired.'});
//         res.status(201).json({
//           status: 'success',
//           data: 'Token successfully validated for ' + user.email + '. You can reset password using token now.',
//         });
//       })
//       .catch((err) => res.status(500).json({message: err.message}));
// };

// /**
//  * Reset user account after token validation
//  */
// exports.resetpassword = (req, res) => {
//   User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}})
//       .then((user) => {
//         if (!user) return res.status(401).json({message: 'Password reset token is invalid or has expired.'});
//         const hash = bcrypt.hashSync(req.body.password, 10);
//         User.updateOne({resetPasswordToken: req.params.token}, {password: hash, resetPasswordToken: undefined, resetPasswordExpires: undefined}, (err) => {
//           if (err) return res.status(500).json({message: err.message});
//         });
//         const mailOptions = {
//           from: config.MAILER_EMAIL,
//           to: user.email,
//           subject: 'Password Reset Successful',
//           text: `Hi ${user.name} \n
// This is a confirmation that the password for your account ${user.email} has just been changed.\n`,
//         };
//         // send mail
//         transporter.sendMail(mailOptions, function(error, info) {
//           if (error) {
//             return res.status(500).json({message: error.message});
//           } else {
//             res.status(201).json({
//               status: 'success',
//               data: 'Your password has been updated.',
//             });
//           }
//         });
//       });
// };
