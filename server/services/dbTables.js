import { Resource } from "sst";

export const TABLES = {
	USER: Resource.ECCSUsers.name,
	CASE: Resource.Cases.name,
	TEACHER_CASE_STUDIES: Resource.TeacherCaseStudies.name,
	FEEDBACK: Resource.Feedback.name,
	STUDENT_RESPONSES: Resource.StudentsResponses.name,
	CERTIFICATES: Resource.Certificates.name,
	STUDENTCASEATTEMPTS: Resource.StudentCaseAttempts.name,
};
