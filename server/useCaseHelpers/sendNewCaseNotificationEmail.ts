import { Resource } from "sst";
import { render } from "jsx-email";
import applicationContext from "../../applicationContext";
import { NewCaseNotificationTemplate } from "../../src/components/email-templates/newCaseNotification.jsx";

const sendNewCaseNotificationEmailToRegisteredStudents = async () => {
	try {
		const emailBody = {
			Html: {
				Data: await render(NewCaseNotificationTemplate()),
			},
		};

		// fetch registered students from the database

		const emailsOfRegisteredStudents = await applicationContext
			.getPersistenceGateway()
			.getRegisteredStudents();

		await applicationContext.getMessageGateway().sendEmail({
			recipients: emailsOfRegisteredStudents,
			subject: "New Case Notification",
			body: emailBody,
			sender: `new-case-alert@${Resource.ECCSEMAIL.sender}`,
		});
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export default sendNewCaseNotificationEmailToRegisteredStudents;
