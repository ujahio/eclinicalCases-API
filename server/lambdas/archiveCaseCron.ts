import { Resource } from "sst";
import {
	QueryCommand,
	UpdateCommand,
	QueryCommandOutput,
	QueryCommandInput,
	UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";
import applicationContext from "../../appContext/applicationContext";

export const handler = async (): Promise<void> => {
	const dbClient = applicationContext.getDBClient();
	console.log("Resource.TeacherCaseStudies", Resource.TeacherCaseStudies);
	const params: QueryCommandInput = {
		TableName: Resource.TeacherCaseStudies.name,
		IndexName: "CaseDeadlineIndex", // Using the correct index
		KeyConditionExpression: "caseStatus = :status", // Query for cases with 'published' status
		ExpressionAttributeValues: {
			":status": "published", // Filter by 'published' case status
		},
	};

	try {
		const command = new QueryCommand(params);
		const data: QueryCommandOutput = await dbClient.send(command);
		if (!data.Items || data.Items.length === 0) {
			console.log("No published cases found.");
			return;
		}

		const caseItem = data.Items[0];
		const caseDeadline = new Date(caseItem.caseDeadline); // caseDeadline is already a string, no need for caseItem.caseDeadline.S
		const now = new Date();

		// Compare the current date with the case deadline
		if (now > caseDeadline) {
			const updateParams: UpdateCommandInput = {
				TableName: Resource.TeacherCaseStudies.name,
				Key: {
					id: caseItem.id, // Use 'id' directly since it's already the primary key
				},
				UpdateExpression: "set caseStatus = :newStatus",
				ExpressionAttributeValues: {
					":newStatus": "archived",
				},
			};

			await dbClient.send(new UpdateCommand(updateParams));
			console.log(`Case ${caseItem.id} archived.`);
		} else {
			console.log(`Case ${caseItem.id} has not reached the deadline.`);
		}
	} catch (error) {
		console.error("Error checking case status:", error);
	}
};
