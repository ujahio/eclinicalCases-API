import 'dotenv/config';
import express from "express";
import serverless from "serverless-http";
import cors from 'cors';
import path from "path";

import authRoutes from './src/routes/auth.routes.js';
import caseRoutes from './src/routes/case.routes.js';
import quizRoutes from './src/routes/quiz.routes.js';
import studentRoutes from './src/routes/student.routes.js';

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
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

export const handler = serverless(app);
