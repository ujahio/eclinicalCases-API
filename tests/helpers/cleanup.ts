// Generated from specs/student-registration-test-plan.md — cleanup helper
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminDeleteUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { Resource } from "sst";

export async function cleanupTestUsers(prefix: string) {
  const cognito = new CognitoIdentityProviderClient({ region: process.env.NEXT_PUBLIC_REGION || "us-east-2" });

  let paginationToken: string | undefined;
  do {
    const response = await cognito.send(new ListUsersCommand({
      UserPoolId: (Resource as any).eccslabs.id,
      Limit: 60,
      PaginationToken: paginationToken,
    }));

    for (const user of response.Users || []) {
      if (user.Username?.startsWith(prefix)) {
        await cognito.send(new AdminDeleteUserCommand({
          UserPoolId: (Resource as any).eccslabs.id,
          Username: user.Username!,
        }));
        console.log(`Deleted test user: ${user.Username}`);
      }
    }

    paginationToken = response.PaginationToken;
  } while (paginationToken);
}
