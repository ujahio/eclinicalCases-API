/* eslint-disable max-len */
// import User from '../models/user.model';
// import Cases from '../models/cases.model';
// import Quizzes from '../models/quizzes.model';
import dynamodb from '../db/dynamodb';

// import cloudinary from 'cloudinary'.v2;
// import cloudConfig from '../config/cloudinary.config';

// cloudinary.config({
//   cloud_name: cloudConfig.CLOUD_NAME,
//   api_key: cloudConfig.CLOUD_API_KEY,
//   api_secret: cloudConfig.CLOUD_API_SECRET,
// });

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   folder: 'case_material',
//   allowedFormats: ['jpg', 'png', 'pdf'],
// });
// parser = multer({storage: storage});


// export const uploadPDF = (req, res) => {
//   const data = {
//     pdf: req.body.pdf,
//   };
//   cloudinary.uploader.upload(data.pdf)
//     .then((result) => {
//       const query = {
//         _id: req.body.caseId,
//       };
//       const objMaterials = [{ 'fileurl': result.secure_url, 'filename': result.public_id, 'filesize': result.bytes }];
//       console.log(result);
//       console.log(objMaterials);
//       Cases.findOneAndUpdate(query, {
//         $push:
//         {
//           caseMaterials: objMaterials,
//         }
//       })
//         .then((updatedcase) => {
//           console.log(updatedcase);
//           res.status(200).json({
//             status: 'success',
//             result: result,
//             data: updatedcase,
//           });
//         })
//         .catch((err) => {
//           // logger.error(err);
//           res.status(400).json({
//             status: 'error ',
//             message: 'Unable to update case with materials. Please try again ' + err,
//           });
//         });
//     }).catch((error) => {
//       res.status(500).send({
//         message: 'failure',
//         error,
//       });
//     });
// };

export const getTeachers = async (req, res) => {
  const params = {
    TableName: 'Users', // Replace with your DynamoDB table name
    FilterExpression: '#role = :role', // Use expression attribute name
    ExpressionAttributeNames: {
      '#role': 'role', // Map reserved keyword to expression attribute name
    },
    ExpressionAttributeValues: {
      ':role': { S: 'teacher' }, // Use the data type for the attribute value
    },
  };


  dynamodb.scan(params, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(400).json({
        status: 'error',
        message: err + ' Unable to find Teacher. Please try again ',
      });
    }

    const users = (data.Items ?? []).map((item) => {
      const { email, username, role, password } = item;
      return { email: email.S, username: username.S, role: role.S, password: password.S };
    });

    res.json(users);
  });
};

// export const getTeacher = (req, res) => {
//   User.findOne({
//     status: 'active',
//     _id: req.params.teacherid,
//   }).lean()
//     .then((teacher) => {
//       delete teacher.password;
//       res.status(200).json({
//         status: 'success',
//         data: teacher,
//       });
//     })
//     .catch((err) => {
//       // logger.error(err);
//       res.status(400).json({
//         status: 'error',
//         message: err + ' Unable to find Teacher. Please try again ',
//       });
//     });
// };

// export const updateTeacher = (req, res) => {
//   const query = {
//     status: 'active',
//     _id: req.params.teacherid,
//   };
//   User.findOneAndUpdate(query, req.body, {
//     new: true,
//   }).lean()
//     .then((teacher) => {
//       delete teacher.password;
//       res.status(200).json({
//         status: 'success',
//         data: teacher,
//       });
//     })
//     .catch((err) => {
//       // logger.error(err);
//       res.status(400).json({
//         status: 'error ',
//         message: 'Unable to update Teacher data. Please try again ' + err,
//       });
//     });
// };

// export const deleteTeacher = (req, res) => {
//   const query = {
//     _id: req.params.teacherid,
//   };

//   User.findOneAndUpdate(query, {
//     status: 'inactive',
//   }, {
//     new: true,
//   }).lean()
//     .then((teacher) => {
//       delete teacher.password;
//       res.status(200).json({
//         status: 'success',
//         data: teacher,
//       });
//     })
//     .catch((err) => {
//       // logger.error(err);
//       res.status(400).json({
//         status: 'error',
//         message: 'Unable to remove Teacher. Please try again ' + err,
//       });
//     });
// };


// // Quizzes
// export const createQuiz = (req, res) => {
//   const quizData = req.body;
//   quiz.createdBy = req.teacherId;
//   quiz.caseId = req.caseId;
//   quiz.createdOn = new Date(Date.now()).toISOString();
//   Quizzes.create(quizData)
//     .then((quiz) => {
//       res.status(201).json({
//         status: 'success',
//         data: quiz,
//       });
//     })
//     .catch((err) => {
//       // logger.error(err);
//       res.status(400).json({
//         status: 'error ' + err,
//         message: 'An error occurred while creating quiz. Please try again ' + err,
//       });
//     });
// };

// // Cases
// export const createCase = (req, res) => {
//   const caseData = req.body;
//   caseData.createdBy = req.teacherId;
//   caseData.createdOn = new Date(Date.now()).toISOString();
//   if (req.body.caseDeadline < caseData.createdOn) {
//     res.status(400).json({
//       status: 'error',
//       message: 'Case deadline cannot be in the Past',
//     });
//   }
//   try {
//     Cases.create(caseData)
//       .then((caseCreated) => {
//         res.status(201).json({
//           status: 'success',
//           data: caseCreated,
//         });
//       })
//       .catch((err) => {
//         // logger.error(err);
//         res.status(400).json({
//           // status: 'error ' + err,
//           message: 'An error occurred while creating case. Please try again ' + err,
//         });
//       });
//   } catch (err) {
//     res.status(400).json({ message: err + ' An error occured while uploading case study materials. Try again.' });
//   }
// };

// export const getAllTeacherCases = (req, res) => {
//   console.log(req);
//   Cases.find({
//     createdBy: req.userId,
//   }).lean()
//     .then((cases) => {
//       res.status(200).json({
//         status: 'success',
//         data: cases,
//       });
//     })
//     .catch((err) => {
//       // logger.error(err);
//       res.status(400).json({
//         status: 'error',
//         message: 'Unable to find any Case. Please try again. ' + err,
//       });
//     });
// };

// export const getOneTeacherCase = (req, res) => {
//   Cases.findOne({
//     _id: req.params.caseid,
//     createdBy: req.userId,
//   }).lean()
//     .then((cases) => {
//       res.status(200).json({
//         status: 'success',
//         data: cases,
//       });
//     })
//     .catch((err) => {
//       // logger.error(err);
//       res.status(400).json({
//         status: 'error',
//         message: 'Unable to load this case. Please try again ' + err,
//       });
//     });
// };

// export const updateOneTeacherCase = (req, res) => {
//   const query = {
//     _id: req.params.caseid,
//     createdBy: req.userId,
//   };
//   Cases.findOneAndUpdate(query, req.body, {
//     new: true,
//   }).lean()
//     .then((cases) => {
//       res.status(200).json({
//         status: 'success',
//         data: cases,
//       });
//     })
//     .catch((err) => {
//       // logger.error(err);
//       res.status(400).json({
//         status: 'error ',
//         message: 'Unable to update Case data. Please try again ' + err,
//       });
//     });
// };
