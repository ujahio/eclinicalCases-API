// Generated from specs/student-registration-test-plan.md — Cognito helpers
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminDeleteUserCommand,
  AdminConfirmSignUpCommand,
  ListUsersCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { Resource } from "sst";

const region = process.env.NEXT_PUBLIC_REGION || "us-east-2";
const cognito = new CognitoIdentityProviderClient({ region });

export function getClientId(): string | undefined {
  const stage = process.env.PLAYWRIGHT_STAGE || "test-e2e";
  const clientName = stage === "production" ? "eccswebclient" : `${stage}.eccswebclient`;
  return (Resource as any)[clientName]?.id;
}

export async function seedTeacher() {
  const email = `e2e-teacher-${Date.now()}@eccs-test.com`;
  const password = "TestTeacherPass1!";

  await cognito.send(new AdminCreateUserCommand({
    UserPoolId: (Resource as any).eccslabs.id,
    Username: email,
    TemporaryPassword: password,
    UserAttributes: [
      { Name: "email", Value: email },
      { Name: "email_verified", Value: "true" },
      { Name: "custom:firstName", Value: "Test" },
      { Name: "custom:lastName", Value: "Teacher" },
      { Name: "custom:user_role", Value: "teacher" },
    ],
    MessageAction: "SUPPRESS",
  }));

  await cognito.send(new AdminSetUserPasswordCommand({
    UserPoolId: (Resource as any).eccslabs.id,
    Username: email,
    Password: password,
    Permanent: true,
  }));

  return { email, password };
}

export async function deleteUser(email: string) {
  try {
    await cognito.send(new AdminDeleteUserCommand({
      UserPoolId: (Resource as any).eccslabs.id,
      Username: email,
    }));
  } catch (e: any) {
    console.warn(`Could not delete ${email}:`, e?.message || e);
  }
}

export async function confirmUser(email: string) {
  await cognito.send(new AdminConfirmSignUpCommand({
    UserPoolId: (Resource as any).eccslabs.id,
    Username: email,
  }));
}

export async function listTeachers() {
  const res = await cognito.send(new ListUsersCommand({
    UserPoolId: (Resource as any).eccslabs.id,
    Limit: 60,
  }));
  return res.Users || [];
}
