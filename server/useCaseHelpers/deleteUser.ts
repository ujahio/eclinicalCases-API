import { Resource } from "sst";
import { AdminDeleteUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import applicationContext from "../../appContext/applicationContext";

const deleteUser = async ({ userEmail }: { userEmail: string }) => {
	const cognitoClient = applicationContext.getUserManagementClient();

	const deleteUserCommand = new AdminDeleteUserCommand({
		UserPoolId: Resource.eccslabs.id,
		Username: userEmail,
	});
	await cognitoClient.send(deleteUserCommand);
};

export default deleteUser;
