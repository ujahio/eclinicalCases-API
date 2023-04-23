/* eslint-disable max-len */
import jwt from 'jsonwebtoken';
import dynamodb from '../db/dynamodb';
// const db = require('../models');
// const User = db.user;
// const Role = db.role;

export const verifyToken = (req, res, next) => {
  let token = req.headers['x-access-token'];

  if (!token) {
    return res.status(403).send({ message: 'No token provided!' });
  }

  token = token.split(' ')[1];

  jwt.verify(token, process.env.JWT_KEY, async (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Unauthorized!' });
    }

    // check if user with the token exists in db
    const params = {
      TableName: 'Users',
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': { S: decoded.email },
      },
    };

    try {
      const data = await dynamodb.query(params).promise();
      if ((data.Items ?? []).length === 0) {
        return res.status(401).send({ message: 'Unauthorized!' });
      }

      next();
    } catch (err) {
      console.log('Error querying table:', err);
    }
  });
};

// const isAdmin = (req, res, next) => {
//   User.findById(req.userId).exec((err, user) => {
//     if (err) {
//       res.status(500).send({ message: err });
//       return;
//     }

//     Role.find(
//       {
//         _id: { $in: user.roles },
//       },
//       (err, roles) => {
//         if (err) {
//           res.status(500).send({ message: err });
//           return;
//         }

//         for (let i = 0; i < roles.length; i++) {
//           if (roles[i].name === 'admin') {
//             next();
//             return;
//           }
//         }

//         res.status(403).send({ message: 'Require Admin Role!' });
//         return;
//       },
//     );
//   });
// };

// const isModerator = (req, res, next) => {
//   User.findById(req.userId).exec((err, user) => {
//     if (err) {
//       res.status(500).send({ message: err });
//       return;
//     }

//     Role.find(
//       {
//         _id: { $in: user.roles },
//       },
//       (err, roles) => {
//         if (err) {
//           res.status(500).send({ message: err });
//           return;
//         }
//         for (let i = 0; i < roles.length; i++) {
//           if (roles[i].name === 'moderator') {
//             next();
//             return;
//           }
//         }
//         res.status(403).send({ message: 'Require Moderator Role!' });
//         return;
//       },
//     );
//   });
// };
