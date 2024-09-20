import dbClient from "../services/dbClient.js";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import {
  GetCommand,
  PutCommand,
  ScanCommand,
  DeleteCommand,
  UpdateCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { readSingleItem } from "../services/dbOps.js";
import { TABLES } from "../services/dbTables.js";

const addCase = async (req, res) => {
  const userID = req.validatedUser.id;
  const caseData = req.body;
  const draft = caseData.draft === "true";
  // const caseDeadline = new Date(caseData.caseDeadline).toISOString();
  const caseMaterials = req.files.map((file) => ({
    filename: file.originalname,
    filePath: file.location,
  }));

  const caseItem = {
    id: uuidv4(),
    createdBy: userID,
    createdAt: Date.now(),
    caseStatus: draft ? "draft" : "active",
    caseMaterials,
  };

  if (caseData.caseClue) caseItem.caseClue = caseData.caseClue;
  if (caseData.caseDescription) caseItem.caseDescription = caseData.caseDescription;
  if (caseData.caseTopic) caseItem.caseTopic = caseData.caseTopic;
  if (caseData.caseExplanation) caseItem.caseExplanation = caseData.caseExplanation;
  if (caseData.caseDeadline) caseItem.caseDeadline = new Date(caseData.caseDeadline).toISOString();
  if (caseData.caseQuestions) caseItem.caseQuestions = JSON.parse(caseData.caseQuestions);


  if (!draft) {
    const activeCaseParams = {
      TableName: TABLES.CASE,
      FilterExpression: "#caseStatus = :caseStatus",
      ExpressionAttributeNames: {
        "#caseStatus": "caseStatus",
      },
      ExpressionAttributeValues: {
        ":caseStatus": "active",
      },
    };

    const activeCaseCommand = new ScanCommand(activeCaseParams);
    const activeCaseResult = await dbClient.send(activeCaseCommand);
    const activeCase = activeCaseResult.Items[0];

    if (activeCase) {
      return res.status(400).json({ error: "Case is already published" });
    }
  }

  const params = {
    TableName: TABLES.CASE,
    Item: caseItem,
  };

  try {
    const command = new PutCommand(params);
    const result = await dbClient.send(command);
    res.status(200).json({
      message: "Case added successfully.",
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Could not create case: ${error}` });
  }
};

const updateCase = async (req, res) => {
  const caseData = req.body;
  const caseID = req.params.caseID;
  const userId = req.validatedUser.id;

  if (!caseID) {
    return res.status(400).json({ error: "Missing case ID in the request URL." });
  }

  const caseParams = {
    TableName: TABLES.CASE,
    Key: { id: caseID },
    ConditionExpression: "createdBy = :createdBy",
    ExpressionAttributeValues: { ":createdBy": userId },
  };

  try {
    const command = new GetCommand(caseParams);
    const result = await dbClient.send(command);
    const caseItem = result.Item;

    if (!caseItem) {
      res.status(404).json({ error: "Case not found" });
      return;
    }

    const caseDeadline = new Date(caseData.caseDeadline).toISOString();
    const caseMaterials = req.files.map((file) => ({
      filename: file.originalname,
      filePath: file.location,
    }));

    let updateExpression = "SET ";
    let expressionAttributeValues = {};
    let expressionAttributeNames = {};

    const updatableFields = ["caseClue", "caseDescription", "caseTopic", "caseExplanation", "caseQuestions"];

    updatableFields.forEach((field) => {
      if (caseData[field] !== undefined) {
        const attributeName = `#${field}`;
        const attributeValue = `:${field}`;

        updateExpression += `${attributeName} = ${attributeValue}, `;
        expressionAttributeNames[attributeName] = field;

        expressionAttributeValues[attributeValue] =
          field === "caseQuestions" ? JSON.parse(caseData[field]) : caseData[field];
      }
    });

    if (caseMaterials.length > 0) {
      const existingCaseMaterials = caseItem.caseMaterials || [];
      const updatedCaseMaterials = [...existingCaseMaterials, ...caseMaterials];
      updateExpression += "#caseMaterials = :caseMaterials, ";
      expressionAttributeNames["#caseMaterials"] = "caseMaterials";
      expressionAttributeValues[":caseMaterials"] = updatedCaseMaterials;
    }

    if (caseDeadline) {
      updateExpression += "#caseDeadline = :caseDeadline, ";
      expressionAttributeNames["#caseDeadline"] = "caseDeadline";
      expressionAttributeValues[":caseDeadline"] = caseDeadline;
    }

    // Remove trailing comma and space from updateExpression
    updateExpression = updateExpression.slice(0, -2);

    const params = {
      TableName: TABLES.CASE,
      Key: { id: caseID },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: "UPDATED_NEW",
    };

    const updateCommand = new UpdateCommand(params);
    const updateResult = await dbClient.send(updateCommand);

    res.status(200).json({
      message: "Case updated successfully.",
      data: updateResult.Attributes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Could not update case: ${error}` });
  }
};

const getCases = async (req, res) => {
  const caseStatus = req.query.caseStatus;

  try {
    let params;
    if (caseStatus === "recent") {
      params = {
        TableName: TABLES.CASE,
        IndexName: "CreatedAtIndex",
        ScanIndexForward: false,
        FilterExpression: "#caseStatus = :caseStatus",
        ExpressionAttributeNames: {
          "#caseStatus": "caseStatus",
        },
        ExpressionAttributeValues: {
          ":caseStatus": "active",
        },
        Limit: 4,
      };
    } else if (caseStatus === "all") {
      params = {
        TableName: TABLES.CASE,
        IndexName: "CreatedAtIndex",
        ScanIndexForward: false,
        FilterExpression: "#caseStatus IN (:active, :draft)",
        ExpressionAttributeNames: {
          "#caseStatus": "caseStatus",
        },
        ExpressionAttributeValues: {
          ":active": "active",
          ":draft": "draft",
        },
      };
    } else {
      params = {
        TableName: TABLES.CASE,
        IndexName: "CreatedAtIndex",
        ScanIndexForward: false, // Descending order
        FilterExpression: "#caseStatus = :caseStatus",
        ExpressionAttributeNames: {
          "#caseStatus": "caseStatus",
        },
        ExpressionAttributeValues: {
          ":caseStatus": caseStatus,
        },
      };
    }

    const command = new ScanCommand(params);
    const result = await dbClient.send(command);
    const cases = result.Items;

    // Fetch the total number of answers and feedbacks for each case
    const detailedCasesPromises = cases.map(async (caseItem) => {
      const caseID = caseItem.id;

      // Count answers
      const answersParams = {
        TableName: TABLES.ANSWER,
        IndexName: "CaseIDIndex",
        KeyConditionExpression: "caseID = :caseID",
        ExpressionAttributeValues: {
          ":caseID": caseID,
        },
        Select: "COUNT",
      };
      const answersCommand = new QueryCommand(answersParams);
      const answersResult = await dbClient.send(answersCommand);
      const totalAnswers = answersResult.Count;

      // Count feedbacks
      const feedbackParams = {
        TableName: TABLES.FEEDBACK,
        IndexName: "CaseIDIndex",
        KeyConditionExpression: "caseID = :caseID",
        ExpressionAttributeValues: {
          ":caseID": caseID,
        },
        Select: "COUNT",
      };
      const feedbackCommand = new QueryCommand(feedbackParams);
      const feedbackResult = await dbClient.send(feedbackCommand);
      const totalFeedbacks = feedbackResult.Count;

      return {
        ...caseItem,
        totalResponses: totalAnswers,
        totalFeedbacks,
      };
    });

    const detailedCases = await Promise.all(detailedCasesPromises);

    res.status(200).json({
      message: "Cases retrieved successfully!",
      data: detailedCases,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not retrieve cases: " + error });
  }
};

const getCase = async (req, res) => {
  try {
    const caseID = req.params.caseID;
    const userId = req.validatedUser.id;

    if (!caseID) {
      return res.status(400).json({ error: "Missing case ID in the request URL." });
    }

    const params = {
      TableName: TABLES.CASE,
      Key: {
        id: caseID,
      },
    };

    const command = new GetCommand(params);
    const result = await dbClient.send(command);
    const caseData = result.Item;
    if (!caseData) {
      return res.status(200).json({
        message: "Case retrieved successfully!",
        data: {},
      });
    }
    res.status(200).json({
      message: "Case retrieved successfully!",
      data: caseData,
    });
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: "Case not found: " + error });
  }
};

const getOngoingCase = async (req, res) => {
  try {
    const params = {
      TableName: TABLES.CASE,
      FilterExpression: "#caseStatus = :caseStatus",
      ExpressionAttributeNames: {
        "#caseStatus": "caseStatus",
      },
      ExpressionAttributeValues: {
        ":caseStatus": "active",
      },
    };

    const command = new ScanCommand(params);
    const result = await dbClient.send(command);
    const cases = result.Items;

    // Fetch the total number of answers and feedbacks for each case
    const detailedCasesPromises = cases.map(async (caseItem) => {
      const caseID = caseItem.id;

      // Count answers
      const answersParams = {
        TableName: TABLES.ANSWER,
        IndexName: "CaseIDIndex",
        KeyConditionExpression: "caseID = :caseID",
        ExpressionAttributeValues: {
          ":caseID": caseID,
        },
        Select: "COUNT",
      };
      const answersCommand = new QueryCommand(answersParams);
      const answersResult = await dbClient.send(answersCommand);
      const totalAnswers = answersResult.Count;

      // Count feedbacks
      const feedbackParams = {
        TableName: TABLES.FEEDBACK,
        IndexName: "CaseIDIndex",
        KeyConditionExpression: "caseID = :caseID",
        ExpressionAttributeValues: {
          ":caseID": caseID,
        },
        Select: "COUNT",
      };
      const feedbackCommand = new QueryCommand(feedbackParams);
      const feedbackResult = await dbClient.send(feedbackCommand);
      const totalFeedbacks = feedbackResult.Count;

      return {
        ...caseItem,
        totalResponses: totalAnswers,
        totalFeedbacks,
      };
    });

    const detailedCases = await Promise.all(detailedCasesPromises);

    res.status(200).json({
      message: "Ongoing case retrieved successfully!",
      data: detailedCases,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not retrieve ongoing cases: " + error });
  }
};

const deleteCase = async (req, res) => {
  try {
    const caseID = req.params.caseID;
    const userId = req.validatedUser.id;

    if (!caseID) {
      return res.status(400).json({ error: "Missing case ID in the request URL." });
    }

    const params = {
      TableName: TABLES.CASE,
      Key: {
        id: caseID,
      },
      ConditionExpression: "createdBy = :createdBy",
      ExpressionAttributeValues: {
        ":createdBy": userId,
      },
    };
    const deleteCommand = new DeleteCommand(params);
    await dbClient.send(deleteCommand);
    res.status(200).json({
      message: "Case deleted successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: "Case not found: " + error });
  }
};

const deleteAllCases = async (req, res) => {
  try {
    const params = {
      TableName: TABLES.CASE,
    };
    const scanCommand = new ScanCommand(params);
    const result = await dbClient.send(scanCommand);
    const cases = result.Items;
    const deletePromises = cases.map((caseItem) => {
      const deleteParams = {
        TableName: TABLES.CASE,
        Key: {
          id: caseItem.id,
        },
      };
      const deleteCommand = new DeleteCommand(deleteParams);
      return dbClient.send(deleteCommand);
    });
    await Promise.all(deletePromises);
    res.status(200).json({
      message: "All cases deleted successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not delete cases: " + error });
  }
};

const duplicateCase = async (req, res) => {
  const caseID = req.body.caseID;

  try {
    if (!caseID) {
      return res.status(400).json({ error: "Missing case ID in the request body." });
    }

    const singleItemParams = {
      TableName: TABLES.CASE,
      Key: {
        id: caseID,
      },
    };

    const originalCase = await readSingleItem(singleItemParams);
    if (!originalCase) {
      return res.status(400).json({ error: "Case does not exist" });
    }

    const duplicateCase = {
      ...originalCase,
      id: uuidv4(),
      caseClue: originalCase.caseClue + " duplicate",
      createdAt: Date.now(),
    };
    const putParams = {
      TableName: TABLES.CASE,
      Item: duplicateCase,
    };

    const command = new PutCommand(putParams);
    const result = await dbClient.send(command);
    res.status(201).json({
      message: "Case duplicated successfully!",
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not duplicate case" });
  }
};

const publishCase = async (req, res) => {
  const caseID = req.body.caseID;
  if (!caseID) {
    return res.status(400).json({
      message: "CaseID not found.",
    });
  }

  const singleItemParams = {
    TableName: TABLES.CASE,
    Key: {
      id: caseID,
    },
  };

  const originalCase = await readSingleItem(singleItemParams);
  console.log("originalCase: ", originalCase);
  if (!originalCase) {
    return res.status(400).json({ error: "Case does not exist" });
  }

  const params = {
    TableName: TABLES.CASE,
    Key: {
      id: caseID,
    },
    UpdateExpression: "set caseStatus = :active",
    ExpressionAttributeValues: {
      ":active": "active",
    },
  };

  try {
    const command = new UpdateCommand(params);
    const result = await dbClient.send(command);
    res.status(200).json({
      message: "Case activated successfully.",
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Could not activate case: ${error}` });
  }
};

const addFeedback = async (req, res) => {
  const studentID = req.validatedUser.id;
  const { caseID, feedback } = req.body;

  const params = {
    TableName: TABLES.FEEDBACK,
    Item: {
      feedbackID: uuidv4(),
      caseID,
      studentID,
      feedback,
      createdAt: Date.now(),
    },
  };

  try {
    const command = new PutCommand(params);
    await dbClient.send(command);
    res.status(200).json({ message: "Feedback submitted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Could not submit feedback: ${error}` });
  }
};

const getCaseFeedback = async (req, res) => {
  const caseID = req.params.caseID;
  console.log("Case ID: ", caseID);

  const params = {
    TableName: TABLES.FEEDBACK,
    IndexName: "CaseIDIndex", // Ensure this index is created
    KeyConditionExpression: "caseID = :caseID",
    ExpressionAttributeValues: {
      ":caseID": caseID,
    },
  };

  try {
    const command = new QueryCommand(params);
    const feedbackResult = await dbClient.send(command);

    // Fetch details of each student
    const studentDetailsPromises = feedbackResult.Items.map(async (feedback) => {
      const userParams = {
        TableName: TABLES.USER,
        IndexName: "IDIndex",
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
          ":id": feedback.studentID,
        },
      };

      const userCommand = new QueryCommand(userParams);
      const userResult = await dbClient.send(userCommand);
      if (userResult.Items.length > 0) {
        const user = userResult.Items[0];
        return {
          student: {
            firstName: user.firstname,
            lastName: user.lastname,
          },
          ...feedback,
        };
      } else {
        throw new Error(`User with id ${feedback.studentID} not found`);
      }
    });

    const detailedFeedbacks = await Promise.all(studentDetailsPromises);

    res.status(200).json({
      message: "Feedbacks retrieved successfully.",
      data: detailedFeedbacks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Could not fetch feedback: ${error}` });
  }
};

const getCaseAnswers = async (req, res) => {
  const caseID = req.params.caseID;

  const answersParams = {
    TableName: TABLES.ANSWER,
    IndexName: "CaseIDIndex",
    KeyConditionExpression: "caseID = :caseID",
    ExpressionAttributeValues: {
      ":caseID": caseID,
    },
  };

  try {
    const answersCommand = new QueryCommand(answersParams);
    const answersResult = await dbClient.send(answersCommand);

    // Fetch details of each student
    const studentDetailsPromises = answersResult.Items.map(async (answer) => {
      const userParams = {
        TableName: TABLES.USER,
        IndexName: "IDIndex",
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
          ":id": answer.studentID,
        },
      };

      const userCommand = new QueryCommand(userParams);
      const userResult = await dbClient.send(userCommand);
      if (userResult.Items.length > 0) {
        const user = userResult.Items[0];
        return {
          student: {
            firstName: user.firstname,
            lastName: user.lastname,
          },
          ...answer,
        };
      } else {
        throw new Error(`User with id ${feedback.studentID} not found`);
      }
    });

    const detailedAnswers = await Promise.all(studentDetailsPromises);

    res.status(200).json({ answers: detailedAnswers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Could not fetch answers: ${error}` });
  }
};

const getCaseAttemptsByStudent = async (req, res) => {
  const studentID = req.params.studentID;

  const params = {
    TableName: TABLES.STUDENTCASEATTEMPTS,
    IndexName: "StudentIDIndex",
    KeyConditionExpression: "studentID = :studentID",
    ExpressionAttributeValues: {
      ":studentID": studentID,
    },
  };

  try {
    const command = new QueryCommand(params);
    const result = await dbClient.send(command);

    res.status(200).json({
      message: "Case attempts retrieved successfully.",
      data: result.Items,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Could not fetch case attempts: ${error}` });
  }
};

const getCaseData = async (req, res) => {
  const caseID = req.params.caseID;
  console.log("Case ID: ", caseID);

  const feedbackParams = {
    TableName: TABLES.FEEDBACK,
    IndexName: "CaseIDIndex",
    KeyConditionExpression: "caseID = :caseID",
    ExpressionAttributeValues: {
      ":caseID": caseID,
    },
  };

  const answersParams = {
    TableName: TABLES.ANSWER,
    IndexName: "CaseIDIndex",
    KeyConditionExpression: "caseID = :caseID",
    ExpressionAttributeValues: {
      ":caseID": caseID,
    },
  };

  try {
    const feedbackCommand = new QueryCommand(feedbackParams);
    const feedbackResult = await dbClient.send(feedbackCommand);

    const answersCommand = new QueryCommand(answersParams);
    const answersResult = await dbClient.send(answersCommand);

    // Combine feedback and answers by studentID
    const combinedData = {};

    feedbackResult.Items.forEach((feedback) => {
      if (!combinedData[feedback.studentID]) {
        combinedData[feedback.studentID] = {
          student: {},
          feedback: [],
          answers: [],
        };
      }
      combinedData[feedback.studentID].feedback.push(feedback);
    });

    answersResult.Items.forEach((answer) => {
      if (!combinedData[answer.studentID]) {
        combinedData[answer.studentID] = {
          student: {},
          feedback: [],
          answers: [],
        };
      }
      combinedData[answer.studentID].answers.push(answer);
    });

    // Fetch details of each student
    const studentDetailsPromises = Object.keys(combinedData).map(async (studentID) => {
      const userParams = {
        TableName: TABLES.USER,
        IndexName: "IDIndex",
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
          ":id": studentID,
        },
      };

      const userCommand = new QueryCommand(userParams);
      const userResult = await dbClient.send(userCommand);
      if (userResult.Items.length > 0) {
        const user = userResult.Items[0];
        combinedData[studentID].student = {
          firstName: user.firstname,
          lastName: user.lastname,
        };
      } else {
        throw new Error(`User with id ${studentID} not found`);
      }
    });

    await Promise.all(studentDetailsPromises);

    const responseData = Object.values(combinedData);

    res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Could not fetch data: ${error}` });
  }
};

export {
  addCase,
  updateCase,
  getCases,
  getCase,
  getOngoingCase,
  deleteCase,
  deleteAllCases,
  duplicateCase,
  publishCase,
  addFeedback,
  getCaseFeedback,
  getCaseAnswers,
  getCaseAttemptsByStudent,
  getCaseData,
};
