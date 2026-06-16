// Generated from specs/student-registration-test-plan.md — fixture
export interface TestUsers {
  teacherEmail: string;
  teacherPassword: string;
  studentEmail: string;
  studentPassword: string;
}

export function generateTestUsers(): TestUsers {
  const ts = Date.now();
  return {
    teacherEmail: `e2e-teacher-${ts}@eccs-test.com`,
    teacherPassword: "TestTeacherPass1!",
    studentEmail: `e2e-student-${ts}@eccs-test.com`,
    studentPassword: "TestStudentPass1!",
  };
}
