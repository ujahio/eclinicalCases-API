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
      firstname: {
        type: String,
        lowercase: true,
        trim: true,
        index: true,
        required: true,
      },
      lastname: {
        type: String,
        lowercase: true,
        trim: true,
        index: true,
        required: true,
      },
      signUpLevel: {
        type: Number,
      },
      paymentStatus: {
        type: String,
        enum: ['active', 'inactive'],
        required: false,
      },
      resetPasswordToken: {
        type: String,
      },
      resetPasswordExpires: {
        type: Date,
      },
      profession: {
        type: String,
      },
      expertise: {
        type: String,
      },
      title: {
        type: String,
      },
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
