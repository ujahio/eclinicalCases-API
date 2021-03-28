/* eslint-disable no-multi-str */
/* eslint-disable max-len */
/* eslint-disable valid-jsdoc */
const config = require('../config/auth.config');
const db = require('../models');
const User = db.user;
const Role = db.role;

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'yahoo',
  secure: true,
  auth: {
    user: config.MAILER_EMAIL,
    pass: config.MAILER_PASS,
  },
  debug: false,
  logger: true,
});

exports.signup = (req, res) => {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
  });
  user.created_on = new Date(Date.now()).toISOString();
  user.status = 'active';
  user.save((err, user) => {
    if (err) {
      res.status(500).send({message: err});
      return;
    }

    if (req.body.roles) {
      Role.find(
          {
            name: {$in: req.body.roles},
          },
          (err, roles) => {
            if (err) {
              res.status(500).send({message: err});
              return;
            }

            user.roles = roles.map((role) => role._id);
            user.save((err) => {
              if (err) {
                res.status(500).send({message: err});
                return;
              }
              res.send({message: 'User was registered successfully!'});
            });
          },
      );
    } else {
      Role.findOne({name: 'user'}, (err, role) => {
        if (err) {
          res.status(500).send({message: err});
          return;
        }

        user.roles = [role._id];
        user.save((err) => {
          if (err) {
            res.status(500).send({message: err});
            return;
          }

          res.send({message: 'User was registered successfully!'});
        });
      }).lean();
    }
  });
};

exports.signin = (req, res) => {
  User.findOne({
    email: req.body.email,
  })
      .populate('roles', '-__v')
      .exec((err, user) => {
        if (err) {
          res.status(500).send({message: err});
          return;
        }

        if (!user) {
          return res.status(404).send({message: 'User Not found.'});
        }

        const passwordIsValid = bcrypt.compareSync(
            req.body.password,
            user.password,
        );

        if (!passwordIsValid) {
          return res.status(401).send({
            accessToken: null,
            message: 'Invalid Email or Password!',
          });
        }

        const token = jwt.sign({id: user.id}, config.secret, {
          expiresIn: 86400, // 24 hours
        });

        const authorities = [];

        for (let i = 0; i < user.roles.length; i++) {
          authorities.push('ROLE_' + user.roles[i].name.toUpperCase());
        }
        res.status(200).send({
          id: user._id,
          username: user.username,
          email: user.email,
          roles: authorities,
          accessToken: token,
        });
      });
};


/**
 * Implement a way to recover user accounts
 */
exports.forgotpassword = (req, res) => {
  const email = req.body.email;
  User.findOne({email: email})
      .then((user) => {
        if (!user) {
          return res.status(401).json({
            message: 'The email address ' + email + ' is not associated with any account. Double-check your email address and try again.',
          });
        }

        const resetPasswordToken = crypto.randomBytes(20).toString('hex');
        const resetPasswordExpires = Date.now() + 3600000; // expires in an hour

        User.updateOne({email: req.body.email}, {resetPasswordToken: resetPasswordToken, resetPasswordExpires: resetPasswordExpires}, (err) => {
          if (err) return res.status(500).json({message: err.message});
        });
        const link = 'http://' + req.headers.host + '/api/auth/validate/' + resetPasswordToken;
        console.log(link);
        const mailOptions = {
          from: 'israelolakanmi@yahoo.com',
          to: email,
          subject: 'Password Reset Request',
          text: `Hi ${email} \n 
Please click on the following link ${link} to reset your password. \n\n 
If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };
        transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
            return res.status(500).json({message: error.message});
          } else {
            res.status(201).json({
              status: 'success',
              data: 'A reset email has been sent to ' + email + '.',
            });
          }
        });
      });
};

/**
 * Validate password reset token
 */
exports.validatepasswordtoken = (req, res) => {
  User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}})
      .then((user) => {
        if (!user) return res.status(401).json({message: 'Password reset token is invalid or has expired.'});
        res.status(201).json({
          status: 'success',
          data: 'Token successfully validated for ' + user.email + '. You can reset password using token now.',
        });
      })
      .catch((err) => res.status(500).json({message: err.message}));
};

/**
 * Reset user account after token validation
 */
exports.resetpassword = (req, res) => {
  User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}})
      .then((user) => {
        if (!user) return res.status(401).json({message: 'Password reset token is invalid or has expired.'});
        const hash = bcrypt.hashSync(req.body.password, 10);
        User.updateOne({resetPasswordToken: req.params.token}, {password: hash, resetPasswordToken: undefined, resetPasswordExpires: undefined}, (err) => {
          if (err) return res.status(500).json({message: err.message});
        });
        const mailOptions = {
          from: config.MAILER_EMAIL,
          to: user.email,
          subject: 'Password Reset Successful',
          text: `Hi ${user.name} \n 
This is a confirmation that the password for your account ${user.email} has just been changed.\n`,
        };
        // send mail
        transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
            return res.status(500).json({message: error.message});
          } else {
            res.status(201).json({
              status: 'success',
              data: 'Your password has been updated.',
            });
          }
        });
      });
};
