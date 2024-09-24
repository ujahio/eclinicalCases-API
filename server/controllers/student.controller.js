import dbClient from "../services/dbClient.js";
import { v4 as uuidv4 } from "uuid";
import { QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { TABLES } from "../services/dbTables.js";
import { sendEmail } from "../services/emailSender.js";

const getStudentCertificates = async (req, res) => {
	const studentID = req.validatedUser.id;

	const params = {
		TableName: TABLES.CERTIFICATES,
		IndexName: "StudentIDIndex",
		KeyConditionExpression: "studentID = :studentID",
		ExpressionAttributeValues: {
			":studentID": studentID,
		},
	};

	try {
		const command = new QueryCommand(params);
		const result = await dbClient.send(command);

		if (result.Items.length === 0) {
			return res
				.status(404)
				.json({ message: "No certificates found for this student." });
		}

		res.status(200).json({
			message: "Certificates retrieved successfully.",
			data: result.Items,
		});
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ error: `Could not fetch certificates: ${error.message}` });
	}
};

const getCertificateByCaseID = async (req, res) => {
	const caseID = req.params.caseID;

	const params = {
		TableName: TABLES.CERTIFICATES,
		FilterExpression: "caseID = :caseID",
		ExpressionAttributeValues: {
			":caseID": caseID,
		},
	};

	try {
		const command = new ScanCommand(params);
		const result = await dbClient.send(command);

		if (result.Items.length === 0) {
			return res
				.status(404)
				.json({ message: "No certificate found for this case." });
		}

		res.status(200).json({
			message: "Certificate retrieved successfully.",
			data: result.Items[0],
		});
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ error: `Could not fetch certificate: ${error.message}` });
	}
};

const newCaseNotification = async (req, res) => {
	res.status(200).json({
		message: "Students notified successfully.",
		// data: result.Items,
	});
	// const caseID = req.body.caseID;

	// const params = {
	// 	TableName: TABLES.CERTIFICATES,
	// 	FilterExpression: "caseID = :caseID",
	// 	ExpressionAttributeValues: {
	// 		":caseID": caseID,
	// 	},
	// };

	// try {
	// 	const emailsOfStudents = [];
	// 	const subjectOfEmail = "New case available!";
	// 	const bodyOfEmail =
	// 		"A new case has been posted. Please login to your account to view the case.";

	// 	await sendEmail(emailsOfStudents, subjectOfEmail, bodyOfEmail);

	// 	res.status(200).json({
	// 		message: "Students notified successfully.",
	// 		data: result.Items,
	// 	});
	// } catch (error) {
	// 	console.error(error);
	// 	res
	// 		.status(500)
	// 		.json({ error: `Could not notify students: ${error.message}` });
	// }
};

export { getStudentCertificates, getCertificateByCaseID, newCaseNotification };
