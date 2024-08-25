import { Request, Response } from "express";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import dbClient from "../services/dbClient.js";

const checkDuplicateUsernameOrEmail = async (req: Request, res: Response, next: any) => {
  const { email } = req.body;

  try {
    const params = {
      TableName: "Users",
      FilterExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email,
      },
    };

    const command = new ScanCommand(params);
    const result: any = await dbClient.send(command);

    const user = result.Items[0];

    if (user) {
      return res.status(400).json({ error: "Username or email already exists" });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error checking for duplicate username or email" });
  }
};

export { checkDuplicateUsernameOrEmail };
