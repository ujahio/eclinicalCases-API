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
      caseMaterials: [
        {
          filename: String,
          fileurl: String,
          filesize: Number,
        },
      ],
      quizzes: [
        [
          {
            question: String,
            questionAlt: [
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
          },
        ],
      ],
      rate: [
        [
          {
            feedback: String,
            ratings: [
              {
                userId: {
                  type: String,
                },
                ratingStar: {
                  type: Number,
                },
              },
            ],
          },
        ],
      ],
    },
    ),
);

module.exports = Cases;
