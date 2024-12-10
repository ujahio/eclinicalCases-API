import { test, expect } from "@playwright/test";
import { MailSlurp } from "mailslurp-client";
import { parse } from "node-html-parser";
import AWS from "aws-sdk";

class MailSlurpHelper {
	private client: MailSlurp;

	constructor(apiKey: string) {
		this.client = new MailSlurp({ apiKey });
	}

	async createInbox() {
		return await this.client.createInbox();
	}

	async waitForLatestEmail(
		inboxId: string,
		timeoutMs = 30000,
		unreadOnly = true
	) {
		return await this.client.waitForLatestEmail(inboxId, timeoutMs, unreadOnly);
	}

	async getEmailContent(emailId: string) {
		return await this.client.emailController.getEmail({ emailId });
	}

	async deleteInbox(inboxId: string) {
		await this.client.deleteInbox(inboxId);
	}
}

class CognitoHelper {
	private cognito: AWS.CognitoIdentityServiceProvider;

	constructor() {
		this.cognito = new AWS.CognitoIdentityServiceProvider({
			region: process.env.NEXT_PUBLIC_REGION,
		});
	}

	async deleteUser(username: string) {
		await this.cognito
			.adminDeleteUser({
				UserPoolId: process.env.COGNITO_USER_POOL_ID!,
				Username: username,
			})
			.promise();
	}
}

test.describe("Registration Flow", () => {
	let mailslurp: MailSlurpHelper;
	// let cognitoHelper: CognitoHelper;
	let inbox: any;

	test.beforeAll(async () => {
		mailslurp = new MailSlurpHelper(process.env.MAILSLURP_API_KEY!);
		// cognitoHelper = new CognitoHelper();
	});

	test.beforeEach(async () => {
		inbox = await mailslurp.createInbox();
	});

	test.afterEach(async () => {
		if (inbox?.id) {
			await mailslurp.deleteInbox(inbox.id);
		}
	});

	test("complete registration flow with email verification", async ({
		page,
		context,
	}) => {
		// Test data
		const testEmail = inbox.emailAddress;
		const testPassword = "TestPassword123!";
		const testUser = {
			firstName: "Test",
			lastName: "User",
		};

		// Step 1: Register new user
		await test.step("Register new user", async () => {
			await page.goto("/signup");

			await page
				.getByRole("textbox", { name: "First Name" })
				.fill(testUser.firstName);
			await page
				.getByRole("textbox", { name: "Last Name" })
				.fill(testUser.lastName);
			await page.getByRole("textbox", { name: "Email" }).fill(testEmail);

			const passwordInput = page.getByRole("textbox", {
				name: "Password",
				exact: true,
			});
			await passwordInput.fill(testPassword);

			// Verify password requirements
			await expect(page.getByText(/At least 8 characters/)).toHaveClass(
				/text-green-600/
			);
			await expect(page.getByText(/At least one uppercase letter/)).toHaveClass(
				/text-green-600/
			);
			await expect(page.getByText(/At least one number/)).toHaveClass(
				/text-green-600/
			);
			await expect(
				page.getByText(/At least one special character/)
			).toHaveClass(/text-green-600/);

			await page
				.getByRole("textbox", { name: "Confirm Password", exact: true })
				.fill(testPassword);
			await Promise.all([
				page.waitForLoadState("networkidle"), // Wait for network to be idle
				page.getByRole("button", { name: "SIGN UP" }).click(),
			]);
		});

		// Step 2: Verify and process confirmation email
		await test.step("Process confirmation email", async () => {
			const email = await mailslurp.waitForLatestEmail(inbox.id, 60000);
			expect(email.subject).toBe("Confirm your registration");

			const emailContent = await mailslurp.getEmailContent(email.id);
			const root = parse(emailContent.body ?? "");

			// Verify email content
			const textContent = root.text;
			expect(textContent).toContain(
				"Thank you for registering with e-Clinical Cases Solutions"
			);
			expect(textContent).toContain("click this link");

			// Extract and verify confirmation link
			const linkElement = root.querySelector(
				'a[href*="confirmUser?client_id="]'
			);
			const confirmationLink = linkElement?.getAttribute("href");
			expect(confirmationLink).toBeTruthy();

			// Open confirmation link in new tab
			const confirmationPage = await context.newPage();
			await confirmationPage.goto(confirmationLink!);

			// Verify confirmation success
			await expect(
				confirmationPage.getByText("Your registration has been confirmed!")
			).toBeVisible();
			await confirmationPage.close();
		});

		// Step 3: Cleanup
		// await test.step("Cleanup test user", async () => {
		// 	await cognitoHelper.deleteUser(testEmail);
		// });
	});
});
