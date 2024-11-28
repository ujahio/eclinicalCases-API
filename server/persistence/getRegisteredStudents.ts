import {
	ListUsersCommand,
	ListUsersCommandOutput,
	UserType,
} from "@aws-sdk/client-cognito-identity-provider";
import { Resource } from "sst";
import applicationContext, {
	ApplicationContext,
} from "../../appContext/applicationContext";
import { StudentDetails } from "../useCaseHelpers/sendNewCaseNotificationEmail";

const getStudentDetails = async (
	applicationContext: ApplicationContext,
	userPoolId: string
): Promise<StudentDetails[]> => {
	const cognitoClient = applicationContext.getUserManagementClient();
	let paginationToken: string | undefined = undefined;
	const studentDetails: StudentDetails[] = [];

	try {
		do {
			// Fetch a batch of users
			const response: ListUsersCommandOutput = await cognitoClient.send(
				new ListUsersCommand({
					UserPoolId: userPoolId,
					PaginationToken: paginationToken,
				})
			);

			const users: UserType[] = response.Users || [];

			// Filter users by custom:user_role = "student"
			const registeredStudents = users.filter((user: UserType) =>
				user.Attributes?.some(
					(attr) => attr.Name === "custom:user_role" && attr.Value === "student"
				)
			);

			// Extract email, firstName, and lastName for each student
			const details = registeredStudents.map((user) => {
				const email =
					user.Attributes?.find((attr) => attr.Name === "email")?.Value || "";
				const firstName =
					user.Attributes?.find((attr) => attr.Name === "custom:firstName")
						?.Value || "";
				const lastName =
					user.Attributes?.find((attr) => attr.Name === "custom:lastName")
						?.Value || "";

				return { email, firstName, lastName };
			});

			// Add to the overall result
			studentDetails.push(...details);

			// Update pagination token
			paginationToken = response.PaginationToken;
		} while (paginationToken); // Continue while there are more pages of users

		return studentDetails;
	} catch (error) {
		throw error;
	}
};
const getRegisteredStudents = async (): Promise<StudentDetails[]> => {
	try {
		const studentDetails = await getStudentDetails(
			applicationContext,
			Resource.eccslabs.id
		);
		return studentDetails;
	} catch (error) {
		console.error("Error fetching student details:", error);
		throw error;
	}
};

export default getRegisteredStudents;
