const mongoose = require('mongoose');

const Cases = mongoose.model(
    'Cases',
    new mongoose.Schema({
      caseClue: String,
      caseDescription: String,
      caseTopic: String,
      caseExplanation: String,
      caseDeadline: Date,
      createdBy: String,
      createdOn: Date,
      caseMaterials: {
        filename: String,
        filepath: String,
        fileid: String,
      },
      quizDesc: String,
      quizAlternatives: [
        {
          text: {
            type: String,
            required: true,
          },
          isCorrect: {
            type: Boolean,
            required: true,
            default: false,
          },
        },
      ],
      ratingsInfo: String,
      ratings:
        [{
          userId: String,
          rate: Number,
        }],
    },
    ),
);

module.exports = Cases;
