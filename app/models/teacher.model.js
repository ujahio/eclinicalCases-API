const mongoose = require('mongoose');

const Teacher = mongoose.model(
    'Teacher',
    new mongoose.Schema({
      username: String,
      email: String,
      password: String,
      resetPasswordToken: String,
      resetPasswordExpires: Date,
      roles: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Role',
        },
      ],
    }),
);

module.exports = Teacher;
