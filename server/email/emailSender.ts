import { SendEmailCommand } from "@aws-sdk/client-sesv2";
import applicationContext from "../../appContext/applicationContext";

type EmailHtmlProps = {
	Html: {
		Data: string;
	};
};

export type EmailProps = {
	sender: string;
	recipients: string[];
	subject: string;
	body: EmailHtmlProps;
};

export const sendEmail = async ({
	recipients,
	subject,
	body,
	sender,
}: EmailProps) => {
	const sesClient = applicationContext.getMessagingClient();

	try {
		await sesClient.send(
			new SendEmailCommand({
				FromEmailAddress: sender,
				Destination: {
					ToAddresses: recipients,
				},
				Content: {
					Simple: {
						Subject: {
							Data: subject,
						},
						Body: body,
					},
				},
			})
		);
	} catch (error) {
		console.error(error);
		throw error;
	}
};
