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

exports.addCase = async (req, res) => {
  const userID = req.validatedUser.id;
  const caseData = req.body;
  const draft = caseData.draft === "true";
  const caseDeadline = new Date(caseData.caseDeadline).toISOString();
  const caseMaterials = req.files.map((file) => ({
    filename: file.originalname,
    filePath: path.join(file.destination, file.originalname),
  }));

  const params = {
    TableName: "Cases",
    Item: {
      id: uuidv4(),
      caseClue: caseData.caseClue,
      caseDescription: caseData.caseDescription,
      caseTopic: caseData.caseTopic,
      caseExplanation: caseData.caseExplanation,
      caseDeadline: caseDeadline,
      createdBy: userID,
      createdAt: Date.now(),
      caseQuestions: caseData.caseQuestions,
      caseStatus: draft ? "draft" : "active",
      caseMaterials,
    },
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

exports.updateCase = async (req, res) => {
  const caseData = req.body;
  const caseId = req.params.caseId;
  const userId = req.validatedUser.id;
  console.log("caseId: ", caseId);

  if (!caseId) {
    return res
      .status(400)
      .json({ error: "Missing case ID in the request URL." });
  }

  const caseParams = {
    TableName: "Cases",
    Key: {
      id: caseId,
    },
    ConditionExpression: "createdBy = :createdBy",
    ExpressionAttributeValues: {
      ":createdBy": userId,
    },
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
      filePath: path.join(file.destination, file.originalname),
    }));

    let updateExpression = "SET ";
    let expressionAttributeValues = {};
    console.log("caseMaterials: ", caseMaterials);

    let updatableFields = [
      "caseClue",
      "caseDescription",
      "caseTopic",
      "caseExplanation",
      "caseDeadline",
      "caseQuestions",
      "caseMaterials",
    ];

    updatableFields.forEach((field) => {
      if (caseData[field] !== undefined) {
        updateExpression += `${field} = :${field},`;
        expressionAttributeValues[`:${field}`] = caseData[field];
      }
      if (field === "caseMaterials" && caseMaterials.length > 0) {
        updateExpression += `${field} = :${field}`;
        expressionAttributeValues[`:${field}`] = caseMaterials;
      }
    });

    if (updateExpression.endsWith(",")) {
      updateExpression = updateExpression.slice(0, -1);
    }

    const params = {
      TableName: "Cases",
      Key: {
        id: caseId,
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "UPDATED_NEW",
    };

    if (caseDeadline) {
      expressionAttributeValues[":caseDeadline"] = caseDeadline;
      updateExpression += `, caseDeadline = :caseDeadline`;
    }

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

exports.getCases = async (req, res) => {
  const caseStatus = req.query.caseStatus;

  try {
    if (caseStatus === "recent") {
      params = {
        TableName: "Cases",
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
    } else {
      params = {
        TableName: "Cases",
        IndexName: "CreatedAtIndex",
        ScanIndexForward: false, // Descending order
        FilterExpression: "#caseStatus = :caseStatus",
        ExpressionAttributeNames: {
          "#caseStatus": "caseStatus"
        },
        ExpressionAttributeValues: {
          ":caseStatus": caseStatus
        }
      };
    }

    const command = new ScanCommand(params);
    const result = await dbClient.send(command);
    const cases = result.Items;
    console.log(cases.map(item => item.createdAt));
    res.status(200).json({
      message: "Cases retrieved successfully!",
      data: cases,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not retrieve cases: " + error });
  }
};

exports.getCase = async (req, res) => {
  try {
    const caseId = req.params.caseId;
    const userId = req.validatedUser.id;

    if (!caseId) {
      return res
        .status(400)
        .json({ error: "Missing case ID in the request URL." });
    }

    const params = {
      TableName: "Cases",
      Key: {
        id: caseId,
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

exports.deleteCase = async (req, res) => {
  try {
    const caseId = req.params.caseId;
    const userId = req.validatedUser.id;

    if (!caseId) {
      return res
        .status(400)
        .json({ error: "Missing case ID in the request URL." });
    }

    const params = {
      TableName: "Cases",
      Key: {
        id: caseId,
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

exports.deleteAllCases = async (req, res) => {
  try {
    const params = {
      TableName: "Cases",
    };
    const scanCommand = new ScanCommand(params);
    const result = await dbClient.send(scanCommand);
    const cases = result.Items;
    const deletePromises = cases.map((caseItem) => {
      const deleteParams = {
        TableName: "Cases",
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

exports.duplicateCase = async (req, res) => {
  const caseId = req.body.caseId;

  try {
    if (!caseId) {
      return res
        .status(400)
        .json({ error: "Missing case ID in the request body." });
    }

    const singleItemParams = {
      TableName: "Cases",
      Key: {
        id: caseId,
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
      createdAt: Date.now()
    };
    const putParams = {
      TableName: TABLES.CASE,
      Item: duplicateCase
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
