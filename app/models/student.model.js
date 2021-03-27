const mongoose = require("mongoose");

const Student = mongoose.model(
  "Student",
  new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    profession: String,
    expertise: String,
    title: String,
    premium: Boolean,
    lastPaymentDate: Date,
    certificates: {
      caseName: String,
      dateOfCompletion: Date
    },
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
      }
    ]
  })
); 

module.exports = Student;
