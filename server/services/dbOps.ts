import { GetCommand } from "@aws-sdk/lib-dynamodb";
import dbClient from "./dbClient";

export const readSingleItem = async (params: any) => {
  try {
    const command = new GetCommand(params);
    const result = await dbClient.send(command);
    return result.Item;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
