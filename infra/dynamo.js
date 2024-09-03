export const Users = new sst.aws.Dynamo("Users", {
  fields: {
    email: "string",
    id: "string",
  },
  primaryIndex: { hashKey: "email" },
  globalIndexes: {
    IDIndex: { hashKey: "id" },
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

export const Answers = new sst.aws.Dynamo("Answers", {
  fields: {
    answerID: "string",
    studentID: "string",
    caseID: "string",
  },
  primaryIndex: { hashKey: "answerID", rangeKey: "studentID" },
  globalIndexes: {
    CaseIDIndex: { hashKey: "caseID" },
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
