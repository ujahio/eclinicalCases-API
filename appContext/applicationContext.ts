import { SESv2Client } from "@aws-sdk/client-sesv2";
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { sendEmail } from "../server/email/emailSender";
import sendNewCaseNotificationEmailToRegisteredStudents from "../server/useCaseHelpers/sendNewCaseNotificationEmail";
import getRegisteredStudents from "../server/persistence/getRegisteredStudents";

const region = "me-south-1";

const applicationContext = {
	getMessageGateway: () => ({
		sendEmail,
	}),
	getMessagingClient: () => new SESv2Client({ region }),
	getUserManagementClient: () =>
		new CognitoIdentityProviderClient({
			region,
		}),
	getUseCaseHelpers: () => ({
		sendNewCaseNotificationEmailToRegisteredStudents,
	}),
	getPersistenceGateway: () => ({
		getRegisteredStudents,
	}),
};

export default applicationContext;
