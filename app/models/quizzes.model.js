const mongoose = require('mongoose');

const Quizzes = mongoose.model(
    'Quizzes',
    new mongoose.Schema({
      description: String,
      alternatives: [
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
    ),
);

module.exports = Quizzes;
