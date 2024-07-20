const dbClient = require("../services/dbClient");
const { v4: uuidv4 } = require("uuid");
const {
    GetCommand,
    PutCommand,
    QueryCommand,
} = require("@aws-sdk/lib-dynamodb");
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { generateCertificate } = require("../utils/certificate");
const { s3Client } = require("../middlewares/uploadFile");


exports.getStudentCertificates = async (req, res) => {
    const studentID = req.validatedUser.id;

    const params = {
        TableName: 'Certificates',
        IndexName: 'StudentIDIndex',
        KeyConditionExpression: 'studentID = :studentID',
        ExpressionAttributeValues: {
            ':studentID': studentID,
        },
    };

    try {
        const command = new QueryCommand(params);
        const result = await dbClient.send(command);

        if (result.Items.length === 0) {
            return res.status(404).json({ message: 'No certificates found for this student.' });
        }

        res.status(200).json({
            message: 'Certificates retrieved successfully.',
            data: result.Items,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Could not fetch certificates: ${error.message}` });
    }
};