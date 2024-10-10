export const Users = new sst.aws.Dynamo("Users", {
	fields: {
		email: "string", // User's email
		id: "string", // User's unique ID
		user_role: "string", // User's role: 'student', 'teacher', etc.
	},
	primaryIndex: { hashKey: "email" }, // Primary index based on email
	globalIndexes: {
		IDIndex: { hashKey: "id" }, // Index based on user ID
		RoleIndex: { hashKey: "user_role" }, // New index to query by role (e.g., 'teacher')
	},
});

export const TeacherCaseStudies = new sst.aws.Dynamo("TeacherCaseStudies", {
	fields: {
		id: "string", // case_id
		teacherId: "string", // Teacher's ID
		caseStatus: "string", // Case study status: 'draft', 'published', or 'archived'
		caseDeadline: "string", // Case study deadline
		publishedDate: "string", // Date when the case study was published
	},
	primaryIndex: { hashKey: "id" }, // Primary key based on case_id
	globalIndexes: {
		TeacherStatusIndex: { hashKey: "teacherId", rangeKey: "caseStatus" }, // Index to query by teacher and case status (draft, published, archived)
		CaseDeadlineIndex: { hashKey: "caseStatus", rangeKey: "caseDeadline" }, // Index to find cases that are about to expire
		TeacherPublishedDateIndex: {
			hashKey: "teacherId",
			rangeKey: "publishedDate",
		},
	},
});

export const Cases = new sst.aws.Dynamo("Cases", {
	fields: {
		id: "string",
		createdAt: "number",
	},
	primaryIndex: { hashKey: "id" },
	globalIndexes: {
		CreatedAtIndex: { hashKey: "createdAt" },
	},
});

export const Feedback = new sst.aws.Dynamo("Feedback", {
	fields: {
		feedbackID: "string",
		caseID: "string",
		studentID: "string",
	},
	primaryIndex: { hashKey: "feedbackID", rangeKey: "caseID" },
	globalIndexes: {
		CaseIDIndex: { hashKey: "caseID" },
		StudentIDIndex: { hashKey: "studentID" },
	},
});

export const StudentsResponses = new sst.aws.Dynamo("StudentsResponses", {
	fields: {
		answerID: "string",
		studentID: "string",
		caseID: "string",
	},
	primaryIndex: { hashKey: "answerID", rangeKey: "studentID" },
	globalIndexes: {
		CaseIDIndex: { hashKey: "caseID" },
		StudentIDIndex: { hashKey: "studentID" },
	},
});

export const Certificates = new sst.aws.Dynamo("Certificates", {
	fields: {
		certificateID: "string",
		studentID: "string",
		caseID: "string",
	},
	primaryIndex: { hashKey: "certificateID", rangeKey: "studentID" },
	globalIndexes: {
		StudentIDIndex: { hashKey: "studentID" },
		CaseIDIndex: { hashKey: "caseID" },
	},
});

export const StudentCaseAttempts = new sst.aws.Dynamo("StudentCaseAttempts", {
	fields: {
		attemptID: "string",
		studentID: "string",
	},
	primaryIndex: { hashKey: "attemptID" },
	globalIndexes: {
		StudentIDIndex: { hashKey: "studentID" },
	},
});
