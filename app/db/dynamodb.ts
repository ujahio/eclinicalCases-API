// setup db
import AWS from 'aws-sdk';

AWS.config.update({ region: 'local' });

const dynamodb = new AWS.DynamoDB({
    endpoint: 'http://localhost:8000',
});

export default dynamodb;
