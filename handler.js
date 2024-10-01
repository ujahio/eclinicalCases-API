import "dotenv/config";
import express from "express";
import serverless from "serverless-http";
import cors from "cors";
import bodyParser from "body-parser";

import authRoutes from "./server/routes/auth.routes.js";
import caseRoutes from "./server/routes/case.routes.js";
import quizRoutes from "./server/routes/quiz.routes.js";
import studentRoutes from "./server/routes/student.routes.js";

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ extended: true }));

app.use(cors());
app.use(express.json());
app.options("*", cors());

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.use("/api/auth", authRoutes);
app.use("/api/case", caseRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/student", studentRoutes);

app.use((req, res, next) => {
	return res.status(404).json({
		error: "Page not Found",
	});
});

export const handler = serverless(app);
