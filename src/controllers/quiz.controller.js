const dbClient = require("../services/dbClient");
const { v4: uuidv4 } = require("uuid");
const {
    GetCommand,
    PutCommand,
    QueryCommand,
} = require("@aws-sdk/lib-dynamodb");

exports.submitCaseAnswers = async (req, res) => {
    const studentID = req.validatedUser.id;
    const { caseID, caseTopicAnswer, caseExplanation, answers } = req.body;

    const params = {
        TableName: 'Answers',
        Item: {
            answerID: uuidv4(),
            studentID,
            caseID,
            answers,
            caseTopicAnswer,
            caseExplanation,
            submittedAt: Date.now(),
        },
    };

    try {
        const command = new PutCommand(params);
        await dbClient.send(command);

        // Call grading function and get the result
        const result = await gradeQuiz(caseID, answers);

        // Save the attempt result to the StudentCaseAttempts table
        const attemptParams = {
            TableName: 'StudentCaseAttempts',
            Item: {
                attemptID: uuidv4(),
                studentID,
                caseID,
                passed: result.passed,
                answers,
                correctAnswers: result.correctAnswers,
                submittedAt: Date.now(),
            },
        };
        const attemptCommand = new PutCommand(attemptParams);
        await dbClient.send(attemptCommand);

        res.status(200).json({
            message: 'Answers submitted successfully.',
            // passed: result.passed,
            // correctAnswers: result.correctAnswers,
            // studentAnswers: result.studentAnswers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Could not submit answers: ${error}` });
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


const gradeQuiz = async (caseID, studentAnswers) => {
    const caseParams = {
        TableName: 'Cases',
        Key: { id: caseID },
    };

    try {
        const caseCommand = new GetCommand(caseParams);
        const caseResult = await dbClient.send(caseCommand);
        const caseQuestions = caseResult.Item.caseQuestions;

        const correctAnswers = caseQuestions.map((question) => question.correctAnswer);
        const studentSelectedOptions = studentAnswers.map((answer) => answer.correctAnswer);
        const passed = correctAnswers.every((answer, idx) => answer === studentSelectedOptions[idx]);

        return {
            passed,
            correctAnswers,
            studentAnswers
        };
    } catch (error) {
        console.error(error);
        throw new Error('Could not grade quiz: ' + error);
    }
};
