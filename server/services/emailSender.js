import { Resource } from "sst";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const sesClient = new SESv2Client();

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