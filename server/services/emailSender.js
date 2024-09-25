import { Resource } from "sst";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({ region: "us-east-1" });

export const sendEmail = async (toAddress, subject, body) => {
	try {
		await sesClient.send(
			new SendEmailCommand({
				Source: Resource.MyEmail.sender,
				Destination: {
					ToAddresses: [toAddress],
				},
				Message: {
					/* required */
					Body: {
						/* required */
						Html: {
							Charset: "UTF-8",
							Data: body,
						},
						Text: {
							Charset: "UTF-8",
							Data: "TEXT_FORMAT_BODY",
						},
					},
					Subject: {
						Charset: "UTF-8",
						Data: subject,
					},
				},
			})
		);
	} catch (error) {
		console.error(error);
		throw error;
	}
};
