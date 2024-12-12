import deleteUser from "../server/useCaseHelpers/deleteUser";
import sendNewCaseNotificationEmailToRegisteredStudents from "../server/useCaseHelpers/sendNewCaseNotificationEmail";

const useCaseHelpers = {
	sendNewCaseNotificationEmailToRegisteredStudents,
	deleteUser,
};

export default useCaseHelpers;
