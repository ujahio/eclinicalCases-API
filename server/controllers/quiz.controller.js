import dbClient from "../services/dbClient.js";
import { v4 as uuidv4 } from "uuid";
import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { generateCertificate } from "../utils/certificate.js";
import { s3Client } from "../middlewares/uploadFile.js";

const submitCaseAnswers = async (req, res) => {
  const studentID = req.validatedUser.id;
  const { firstname, lastname } = req.validatedUser;
  const fullName = firstname + " " + lastname;
  const { caseID, caseTopicAnswer, caseExplanation, answers } = req.body;

  const params = {
    TableName: "Answers",
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
    const result = await gradeQuiz(res, caseID, answers, fullName, studentID);

    // Save the attempt result to the StudentCaseAttempts table
    const attemptParams = {
      TableName: "StudentCaseAttempts",
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
      message: "Answers submitted successfully.",
      passed: result.passed,
      pdfURL: result.pdfURL,
      pngURL: result.pngURL,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Could not submit answers: ${error}` });
  }
};

const getStudentsAnswers = async (req, res) => {
  const caseID = req.params.caseID;
  const params = {
    TableName: "Answers",
    IndexName: "CaseIDIndex",
    KeyConditionExpression: "caseID = :caseID",
    ExpressionAttributeValues: {
      ":caseID": caseID,
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

const gradeQuiz = async (res, caseID, studentAnswers, fullName, studentID) => {
  const caseParams = {
    TableName: "Cases",
    Key: { id: caseID },
  };

  try {
    const caseCommand = new GetCommand(caseParams);
    const caseResult = await dbClient.send(caseCommand);
    const caseQuestions = caseResult?.Item?.caseQuestions;
    if (!caseQuestions) {
      return res.status(400).json({ error: `caseQuestions are not found` });
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
      const { pdfBuffer, pngBuffer } = await generateCertificate(fullName, caseTopic);

      const pdfUploadParams = {
        Bucket: "local-bucket",
        Key: `certificates/${certificateID}.pdf`,
        Body: pdfBuffer,
        ACL: "public-read",
        ContentType: "application/pdf",
      };
      const pdfUploadCommand = new PutObjectCommand(pdfUploadParams);
      await s3Client.send(pdfUploadCommand);

      pdfURL = `http://localhost:4599/local-bucket/certificates/${certificateID}.pdf`;

      // Upload PNG to S3
      const pngUploadParams = {
        Bucket: "local-bucket",
        Key: `certificates/${certificateID}.png`,
        Body: pngBuffer,
        ACL: "public-read",
        ContentType: "image/png",
      };
      const pngUploadCommand = new PutObjectCommand(pngUploadParams);
      await s3Client.send(pngUploadCommand);

      pngURL = `http://localhost:4599/local-bucket/certificates/${certificateID}.png`;

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
        TableName: "Certificates",
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
    console.error(error);
    throw new Error("Could not grade quiz: " + error);
  }
};

export { submitCaseAnswers, getStudentsAnswers };
