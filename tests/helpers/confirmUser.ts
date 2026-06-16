// Generated from specs/student-registration-test-plan.md — confirm helper
import { CognitoIdentityProviderClient, AdminConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { Resource } from "sst";

export async function confirmUser(email: string) {
  const cognito = new CognitoIdentityProviderClient({ region: process.env.NEXT_PUBLIC_REGION || "us-east-2" });
  await cognito.send(new AdminConfirmSignUpCommand({
    UserPoolId: (Resource as any).eccslabs.id,
    Username: email,
  }));
}

export default confirmUser;
