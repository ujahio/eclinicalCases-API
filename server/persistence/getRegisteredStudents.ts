import { ListUsersCommand } from "@aws-sdk/client-cognito-identity-provider";
import { Resource } from "sst";
import applicationContext, {
	ApplicationContext,
} from "../../applicationContext";

type CognitoUser = {
	Attributes: { Name: string; Value: string }[];
	Username: string;
	[key: string]: any; // Include any additional properties from the AWS response
};

const getStudentEmails = async (
	applicationContext: ApplicationContext,
	userPoolId: string
) => {
	const cognitoClient = applicationContext.getUserManagementClient();
	let paginationToken: string | undefined = undefined;
	let studentEmails: string[] = [];

	try {
		do {
			const response: any = await cognitoClient.send(
				new ListUsersCommand({
					UserPoolId: userPoolId,
					PaginationToken: paginationToken,
				})
			);

			const users: CognitoUser[] = response.Users || [];

			// Filter users by custom:user_role = "student"
			const registeredUsers: CognitoUser[] = users.filter((user) =>
				user.Attributes.some(
					(attr) => attr.Name === "custom:user_role" && attr.Value === "student"
				)
			);

			// Extract emails from filtered users
			const emails = registeredUsers.map(
				(user) =>
					user.Attributes.find((attr) => attr.Name === "email")?.Value || ""
			);

			studentEmails = studentEmails.concat(emails);

			// Update the pagination token
			paginationToken = response.PaginationToken;
		} while (paginationToken); // Continue while there are more pages of users

		console.log("Student Emails:", studentEmails);
		return studentEmails;
	} catch (error) {
		console.error("Error fetching student emails:", error);
		throw error; // Re-throw the error for upstream handling
	}
};

const getRegisteredStudents = async (): Promise<string[]> => {
	try {
		// Extract emails from the filtered users
		const studentEmails = getStudentEmails(
			applicationContext,
			Resource.eccslabs.id
		);
		console.log("studentEmails", studentEmails);

		return studentEmails;
	} catch (error) {
		console.error("Error fetching student emails:", error);
		throw error;
	}
};

export default getRegisteredStudents;
