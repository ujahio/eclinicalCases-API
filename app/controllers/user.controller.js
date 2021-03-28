const User = require('../models/user.model');

exports.allAccess = (req, res) => {
  res.status(200).send('Public Content.');
};

exports.userBoard = (req, res) => {
  res.status(200).send('User Content.');
};

exports.adminBoard = (req, res) => {
  res.status(200).send('Admin Content.');
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send('Moderator Content.');
};


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
