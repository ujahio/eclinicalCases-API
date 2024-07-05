const { GetCommand } = require("@aws-sdk/lib-dynamodb");
const dbClient = require("../services/dbClient");

exports.readSingleItem = async (params) => {
  try {
    const command = new GetCommand(params);
    const result = await dbClient.send(command);
    return result.Item;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
