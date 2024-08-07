const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require('bcryptjs');
const { PutCommand } = require("@aws-sdk/lib-dynamodb");
require('dotenv').config();
const { decryptPassword } = require('./src/utils/api_utils');

const ddb = new DynamoDB({ endpoint: "http://localhost:8000" });
const USERS_TABLE_NAME = "Users";

const encryptedPassword = "e94acd557217fc4d25d96c85bf80e25e:5632ea438f704cf549dfce93e2bcea47"
let originalPassword = decryptPassword(encryptedPassword, process.env.secretKey);
const hashedPassword = bcrypt.hashSync(originalPassword, 10);

const initialUsers = [
  {
    id: uuidv4(),
    firstname: "John",
    lastname: "Doe",
    email: "teacher@gmail.com",
    password: hashedPassword,
    created_on: new Date(Date.now()).toISOString(),
    status: "active",
    paymentStatus: "inactive",
    roles: "teacher",
  },
  {
    id: uuidv4(),
    firstname: "Micheal",
    lastname: "Scolfield",
    email: "student@gmail.com",
    password: hashedPassword,
    created_on: new Date(Date.now()).toISOString(),
    status: "active",
    paymentStatus: "inactive",
    roles: "student",
  },
];

const addInitialUsers = async () => {
  try {
    for (const user of initialUsers) {
      const params = {
        TableName: USERS_TABLE_NAME,
        Item: user,
      };

      const command = new PutCommand(params);
      await ddb.send(command);
      console.log(`User ${user.email} added.`);
    }
  } catch (error) {
    console.error("Error adding initial users:", error);
  }
};

addInitialUsers();
