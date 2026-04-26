// import { Resource } from "sst";
import { render } from "jsx-email";
import applicationContext from "../../appContext/applicationContext";
import { NewCaseEmailTemplate } from "../../src/components/email-templates/newCaseEmailTemplate.jsx";
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
						Data: await render(NewCaseEmailTemplate(studentName)),
					},
				};

				await applicationContext.getMessageGateway().sendEmail({
					recipients: [email],
					subject: "New Case Notification",
					body: emailBody,
					// sender: `new-case-alert@${Resource.ECCSEMAIL.sender}`,
					sender: "someone",
				});
			}),
		);
	} catch (error) {
		console.error("Error sending emails:", error);
		throw error;
	}
};

const sendNewCaseNotificationEmailToRegisteredStudents = async () => {
	try {
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
