// Create table for users
const createUsersTable = async (dynamodb) => {
    const params = {
        TableName: 'Users',
        KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' },
        ],
        AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'email', AttributeType: 'S' },
            { AttributeName: 'username', AttributeType: 'S' },
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'EmailIndex',
                KeySchema: [
                    { AttributeName: 'email', KeyType: 'HASH' },
                ],
                Projection: {
                    ProjectionType: 'ALL',
                },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 1,
                    WriteCapacityUnits: 1,
                },
            },
            {
                IndexName: 'UsernameIndex',
                KeySchema: [
                    { AttributeName: 'username', KeyType: 'HASH' },
                ],
                Projection: {
                    ProjectionType: 'ALL',
                },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 1,
                    WriteCapacityUnits: 1,
                },
            },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
        },
    };


    // Create table only once
    try {
        await dynamodb.describeTable({ TableName: 'Users' }).promise();
        console.log('Table already exists');
    } catch (err) {
        if (err.code === 'ResourceNotFoundException') {
            try {
                const data = await dynamodb.createTable(params).promise();
                console.log('Table created:', data);
            } catch (err) {
                console.log('Error creating table:', err);
            }
        } else {
            console.log('Error describing table:', err);
        }
    }
};

module.exports = { createUsersTable };
