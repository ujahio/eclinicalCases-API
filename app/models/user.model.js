const mongoose = require('mongoose');

const User = mongoose.model(
    'User',
    new mongoose.Schema({
      email: {
        type: String,
        lowercase: true,
        trim: true,
        index: true,
        unique: true,
        required: true,
      },
      password: {
        type: String,
        required: true,
        bcrypt: true,
      },
      name: {
        type: String,
        trim: true,
      },
      username: {
        type: String,
        lowercase: true,
        trim: true,
        index: true,
        unique: true,
        required: true,
      },
      resetPasswordToken: {
        type: String,
      },
      resetPasswordExpires: {
        type: Date,
      },
      profession: String,
      expertise: String,
      title: String,
      premium: Boolean,
      lastPaymentDate: Date,
      certificates: {
        caseName: String,
        dateOfCompletion: Date,
      },
      status: {
        type: String,
        enum: ['active', 'inactive'],
        required: false,
      },
      created_on: {
        type: String,
        required: true,
      },
      roles: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Role',
        },
      ],
    }),
);

module.exports = User;
