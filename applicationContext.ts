import { SESv2Client } from "@aws-sdk/client-sesv2";
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { EmailProps, sendEmail } from "./server/email/emailSender";
import sendNewCaseNotificationEmailToRegisteredStudents from "./server/useCaseHelpers/sendNewCaseNotificationEmail";
import getRegisteredStudents from "./server/persistence/getRegisteredStudents";

const region = "me-south-1";

export type ApplicationContext = {
	getMessageGateway: () => {
		sendEmail: ({
			recipients,
			subject,
			body,
			sender,
		}: EmailProps) => Promise<void>;
	};
	getMessagingClient: () => SESv2Client;
	getUserManagementClient: () => CognitoIdentityProviderClient;
	getUseCaseHelpers: () => {
		sendNewCaseNotificationEmailToRegisteredStudents: () => Promise<void>;
	};
	getPersistenceGateway: () => {
		getRegisteredStudents: () => Promise<string[]>;
	};
};

const applicationContext: ApplicationContext = {
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
