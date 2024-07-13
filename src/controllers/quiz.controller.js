const dbClient = require("../services/dbClient");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const {
    GetCommand,
    PutCommand,
    ScanCommand,
    DeleteCommand,
    UpdateCommand,
    QueryCommand,
} = require("@aws-sdk/lib-dynamodb");
const { readSingleItem } = require("../services/dbOps");
const { TABLES } = require("../services/dbTables");


exports.submitQuiz = async (req, res) => {
    const studentID = req.validatedUser.id;
    const { caseID, answers } = req.body;

    const params = {
        TableName: 'Answers',
        Item: {
            answerID: uuidv4(),
            studentID,
            caseID,
            answers,
            submittedAt: Date.now(),
        },
    };

    try {
        const command = new PutCommand(params);
        await dbClient.send(command);
        // Call grading function and generate certificate if passed
        // await gradeQuiz(studentID, caseID);
        res.status(200).json({ message: 'Quiz submitted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Could not submit quiz: ${error}` });
    }
};


exports.getStudentsAnswers = async (req, res) => {
    const caseID = req.params.caseID;
    const params = {
        TableName: 'Answers',
        IndexName: 'CaseIDIndex',
        KeyConditionExpression: 'caseID = :caseID',
        ExpressionAttributeValues: {
            ':caseID': caseID,
        },
    };

    try {
        const command = new QueryCommand(params);
        const result = await dbClient.send(command);
        res.status(200).json({ answers: result.Items });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Could not fetch answers: ${error}` });
    }
};

const gradeQuiz = async (studentID, caseID) => {
    // Fetch correct answers and compare
    const quizParams = {
        TableName: 'Quizzes',
        Key: { caseID },
    };

    const answersParams = {
        TableName: 'Answers',
        IndexName: 'CaseIDIndex', // Referencing the secondary index
        KeyConditionExpression: 'caseID = :caseID AND studentID = :studentID',
        ExpressionAttributeValues: {
            ':caseID': caseID,
            ':studentID': studentID,
        },
    };

    try {
        const quizCommand = new GetCommand(quizParams);
        const answersCommand = new QueryCommand(answersParams);
        const quiz = await dbClient.send(quizCommand);
        const answers = await dbClient.send(answersCommand);

        const correctAnswers = quiz.Item.caseQuestions.map(q => q.correctOption);
        const studentAnswers = answers.Items[0].answers;

        const isPassed = correctAnswers.every((answer, idx) => answer === studentAnswers[idx]);

        if (isPassed) {
            const certificateParams = {
                TableName: 'Certificates',
                Item: {
                    certificateID: uuidv4(),
                    studentID,
                    caseID,
                    issuedAt: Date.now(),
                },
            };
            const certificateCommand = new PutCommand(certificateParams);
            await dbClient.send(certificateCommand);
        }
    } catch (error) {
        console.error(error);
    }
};
