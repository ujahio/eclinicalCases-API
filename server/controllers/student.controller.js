import dbClient from "../services/dbClient.js";
import { v4 as uuidv4 } from "uuid";
import { QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { TABLES } from "../services/dbTables.js";

const getStudentCertificates = async (event) => {
  const studentID = event.requestContext.authorizer.claims.sub;

  const params = {
    TableName: TABLES.CERTIFICATES,
    IndexName: "StudentIDIndex",
    KeyConditionExpression: "studentID = :studentID",
    ExpressionAttributeValues: {
      ":studentID": studentID,
    },
  };

  try {
    const command = new QueryCommand(params);
    const result = await dbClient.send(command);

    if (result.Items.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "No certificates found for this student." }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Certificates retrieved successfully.",
        data: result.Items,
      }),
    };
  } catch (error) {
    console.error("Error fetching certificates: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Could not fetch certificates: ${error.message}` }),
    };
  }
};

const getCertificateByCaseID = async (event) => {
  const caseID = event.pathParameters.caseID;

  const params = {
    TableName: TABLES.CERTIFICATES,
    FilterExpression: "caseID = :caseID",
    ExpressionAttributeValues: {
      ":caseID": caseID,
    },
  };

  try {
    const command = new ScanCommand(params);
    const result = await dbClient.send(command);

    if (result.Items.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "No certificate found for this case." }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Certificate retrieved successfully.",
        data: result.Items[0],
      }),
    };
  } catch (error) {
    console.error("Error fetching certificate by case ID: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Could not fetch certificate: ${error.message}` }),
    };
  }
};

export { getStudentCertificates, getCertificateByCaseID };
