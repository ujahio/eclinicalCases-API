require('dotenv').config()
const express = require("express");
const serverless = require("serverless-http");
const cors = require('cors');
const path = require("path")

const authRoutes = require('./src/routes/auth.routes');
const caseRoutes = require('./src/routes/case.routes');
const quizRoutes = require('./src/routes/quiz.routes');
const studentRoutes = require('./src/routes/student.routes');

const app = express();

app.use(cors());
app.options("*", cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/auth', authRoutes);
app.use('/api/case', caseRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/student', studentRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

exports.handler = serverless(app);
