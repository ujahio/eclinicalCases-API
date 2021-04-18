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
    }),
);

module.exports = Cases;
