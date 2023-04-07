// setup db
const AWS = require('aws-sdk');
AWS.config.update({ region: 'local' });

const dynamodb = new AWS.DynamoDB({
    endpoint: 'http://localhost:8000',
});

module.exports = {
    dynamodb,
};

