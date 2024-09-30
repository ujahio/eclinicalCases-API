import dbClient from "../services/dbClient.js";
import { v4 as uuidv4 } from "uuid";
import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { PutObjectCommand } from "@aws-sdk/client-s3";
// import { generateCertificate } from "../utils/certificate.js";
import { s3Client } from "../middlewares/uploadFile.js";
import { TABLES } from "../services/dbTables.js";

const submitCaseAnswers = async (event) => {
  const studentID = event.requestContext.authorizer.claims.sub;
  const { firstname, lastname } = event.requestContext.authorizer.claims;
  const fullName = `${firstname} ${lastname}`;
  const { caseID, caseTopicAnswer, caseExplanation, answers } = JSON.parse(event.body);

  const params = {
    TableName: TABLES.ANSWER,
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
    const result = await gradeQuiz(caseID, answers, fullName, studentID);

    // Save the attempt result to the StudentCaseAttempts table
    const attemptParams = {
      TableName: TABLES.STUDENTCASEATTEMPTS,
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

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Answers submitted successfully.",
        passed: result.passed,
        pdfURL: result.pdfURL,
        pngURL: result.pngURL,
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Could not submit answers: ${error.message}` }),
    };
  }
};

const getStudentsAnswers = async (event) => {
  const caseID = event.pathParameters.caseID;

  const params = {
    TableName: TABLES.ANSWER,
    IndexName: "CaseIDIndex",
    KeyConditionExpression: "caseID = :caseID",
    ExpressionAttributeValues: {
      ":caseID": caseID,
    },
  };

  try {
    const command = new QueryCommand(params);
    const result = await dbClient.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({ answers: result.Items }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Could not fetch answers: ${error.message}` }),
    };
  }
};

const gradeQuiz = async (caseID, studentAnswers, fullName, studentID) => {
  const caseParams = {
    TableName: TABLES.CASE,
    Key: { id: caseID },
  };

  try {
    const caseCommand = new GetCommand(caseParams);
    const caseResult = await dbClient.send(caseCommand);
    const caseQuestions = caseResult?.Item?.caseQuestions;
    if (!caseQuestions) {
      throw new Error(`caseQuestions are not found`);
    }
    const caseTopic = caseResult.Item.caseTopic;

    const correctAnswers = caseQuestions.map((question) => question.correctAnswer);
    const studentSelectedOptions = studentAnswers.map((answer) => answer.correctAnswer);
    const passed = correctAnswers.every((answer, idx) => answer === studentSelectedOptions[idx]);

    // Generate certificate
    let pdfURL = "";
    let pngURL = "";
    if (passed) {
      const certificateID = uuidv4();
      // const { pdfBuffer, pngBuffer } = await generateCertificate(fullName, caseTopic);

      // Upload PDF to S3
      const pdfUploadParams = {
        Bucket: "local-bucket",
        Key: `certificates/${certificateID}.pdf`,
        Body: "pdfBuffer",
        ACL: "public-read",
        ContentType: "application/pdf",
      };
      pdfURL = await uploadFileToBucket(pdfFile);

      // Upload PNG to S3
      const pngFile = {
        originalname: `${certificateID}.png`,
        buffer: pngBuffer,
      };
      pngURL = await uploadFileToBucket(pngFile);

      // Save certificate record in DynamoDB
      const certificateRecord = {
        certificateID,
        studentID: studentID,
        caseID,
        pdfURL,
        pngURL,
        generatedAt: new Date().toISOString(),
      };

      const putCommand = new PutCommand({
        TableName: TABLES.CERTIFICATES,
        Item: certificateRecord,
      });
      await dbClient.send(putCommand);
    }

    return {
      passed,
      correctAnswers,
      studentAnswers,
      pdfURL: pdfURL,
      pngURL: pngURL,
    };
  } catch (error) {
    console.error("Error grading quiz: ", error);
    throw new Error("Could not grade quiz: " + error.message);
  }
};

export { submitCaseAnswers, getStudentsAnswers };
