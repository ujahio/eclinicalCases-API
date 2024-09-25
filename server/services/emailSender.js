import { Resource } from "sst";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient();

export const sendEmail = async (toAddress, subject, body) => {
	try {
		await sesClient.send(
			new SendEmailCommand({
				FromEmailAddress: Resource.MyEmail.sender,
				Destination: {
					ToAddresses: [toAddress],
				},
				Content: {
					Simple: {
						Subject: {
							Data: subject,
						},
						Body: {
							Text: {
								Data: body,
							},
						},
					},
				},
			})
		);
	} catch (error) {
		console.error(error);
		throw error;
	}
};
