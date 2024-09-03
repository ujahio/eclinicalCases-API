import { UpdateCommand, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import dbClient from "../services/dbClient.js";
import crypto from "crypto";
import { TABLES } from "../services/dbTables.js";

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000);
}

async function storeOtpInDb(email, otp) {
  const params = {
    TableName: TABLES.USER,
    Key: {
      email: email,
    },
    UpdateExpression: "set otp = :otp",
    ExpressionAttributeValues: {
      ":otp": otp,
    },
  };

  const command = new UpdateCommand(params);
  await dbClient.send(command);
}

async function getOtpFromDb(email) {
  const params = {
    TableName: TABLES.USER,
    Key: {
      email: email,
    },
    ProjectionExpression: "otp",
  };

  const command = new GetCommand(params);
  const result = await dbClient.send(command);
  return result.Item.otp;
}

async function updateUserPassword(email, newPassword) {
  const params = {
    TableName: TABLES.USER,
    Key: {
      email: email,
    },
    UpdateExpression: "set password = :newPassword",
    ExpressionAttributeValues: {
      ":newPassword": newPassword,
    },
  };
  const command = new UpdateCommand(params);
  const result = await dbClient.send(command);
  return result.Attributes;
}

async function getUserByEmail(email) {
  try {
    const params = {
      TableName: TABLES.USER,
      FilterExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email,
      },
    };

    const command = new ScanCommand(params);
    const result = await dbClient.send(command);
    return result.Items[0];
  } catch (error) {
    console.error(error);
    throw error;
  }
};

function encryptPassword(password, secretKey) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(secretKey, "hex"), iv);
  let encrypted = cipher.update(password, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decryptPassword(encryptedPassword, secretKey) {
  const textParts = encryptedPassword.split(":");
  const iv = Buffer.from(textParts.shift(), "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(secretKey, "hex"), iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export { updateUserPassword, generateOtp, storeOtpInDb, getOtpFromDb, encryptPassword, decryptPassword, getUserByEmail };
