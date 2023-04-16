/* eslint-disable require-jsdoc */
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import dynamodb from './app/db/dynamodb';
import { initTables } from './app/tables/index';
import { homeRoutes } from './app/routes/home.routes';
import { authRoutes } from './app/routes/auth.routes';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(fileUpload());
const corsOptions = {
  origin: 'http://localhost:8081',
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// init tables
initTables(dynamodb);

app.get('/users', async (req, res) => {
  const params = {
    TableName: 'Users',
  };

  try {
    const data = await dynamodb.scan(params).promise();
    const users = data.Items.map((item) => {
      const user = {};
      Object.keys(item).forEach((key) => {
        user[key] = Object.values(item[key])[0];
      });
      return user;
    });
    res.status(200).send(users);
  } catch (err) {
    res.status(500).send({ error: err });
  }
});

// // routes
homeRoutes(app);
authRoutes(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
