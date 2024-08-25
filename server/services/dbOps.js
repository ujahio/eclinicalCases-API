import { GetCommand } from "@aws-sdk/lib-dynamodb";
import dbClient from "../services/dbClient.js";

export const readSingleItem = async (params) => {
  try {
    const command = new GetCommand(params);
    const result = await dbClient.send(command);
    return result.Item;
  } catch (error) {
    console.error(error);
    throw error;
  }
};