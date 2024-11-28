import { Resource } from "sst";
import { render } from "jsx-email";
import applicationContext from "../../appContext/applicationContext";
import { NewCaseNotificationTemplate } from "../../src/components/email-templates/newCaseNotification.jsx";
export type StudentDetails = {
	email: string;
	firstName: string;
	lastName: string;
};

export const sendEmails = async (studentDetails: StudentDetails[]) => {
	try {
		await Promise.all(
			studentDetails.map(async ({ email, firstName, lastName }) => {
				const studentName = `${firstName} ${lastName}`;

				const emailBody = {
					Html: {
						Data: await render(NewCaseNotificationTemplate(studentName)),
					},
				};

				await applicationContext.getMessageGateway().sendEmail({
					recipients: [email],
					subject: "New Case Notification",
					body: emailBody,
					sender: `new-case-alert@${Resource.ECCSEMAIL.sender}`,
				});
			})
		);
	} catch (error) {
		console.error("Error sending emails:", error);
		throw error;
	}
};

const sendNewCaseNotificationEmailToRegisteredStudents = async () => {
	try {
		// fetch registered students from the database

		const studentDetails = await applicationContext
			.getPersistenceGateway()
			.getRegisteredStudents();

		await sendEmails(studentDetails);
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export default sendNewCaseNotificationEmailToRegisteredStudents;
