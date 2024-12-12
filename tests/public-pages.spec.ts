import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
	});

	test("should display header content correctly", async ({ page }) => {
		await expect(
			page
				.getByRole("heading", { level: 1 })
				.getByText("Welcome to e-Clinical Cases Solutions")
		).toBeVisible();

		// Verify key description phrases
		await expect(
			page.getByText(
				"e-Clinical Cases Solutions aim to provide category 1 CME in laboratory medicine as interactive clinical cases online. It is suitable for learning for all laboratorians, endocrinologists, rheumatologists, nurses, family and internal medicine physicians, and all users of the clinical laboratory. The cases are authentic, acquired over 20 years of clinical practice. Cases can be accessed online anywhere, and at any time."
			)
		).toBeVisible();
		await expect(
			page.getByText(
				"Cases will be posted fortnightly. Registered participants earn 1 category 1 CME point per case. Learning is active as participants consider and comment on the case and compare answers to a model answer by the tutor. This is accompanied by teaching on the subject and a test of learning by multiple choice questions (MCQs)."
			)
		).toBeVisible();
		await expect(
			page.getByText("A total of 20 category 1 CMEs are offered in one year.")
		).toBeVisible();
		await expect(
			page.getByText(
				"NMC Healthcare is accredited by the Abu Dhabi Department of Health to provide CME/CPD for healthcare providers. This activity is designated for XXXX CME/CPD credits."
			)
		).toBeVisible();
	});

	test("should have working CTA buttons", async ({ page }) => {
		// Get all "GET STARTED" buttons
		const getStartedButtons = page
			.getByRole("button", {
				name: "GET STARTED",
			})
			.all();

		// Verify each button is visible and routes correctly
		const buttons = await getStartedButtons;
		for (const button of buttons) {
			await expect(button).toBeVisible();
			await button.click();
			await expect(page).toHaveURL("/signup");
			// Navigate back to test the next button
			await page.goto("/");
		}
	});

	test("should display all required images", async ({ page }) => {
		// Check all three images are present
		await expect(page.getByAltText(/woman doctor/)).toBeVisible();
		await expect(page.getByAltText(/male doctor/)).toBeVisible();
		await expect(page.getByAltText(/female lab assistant/)).toBeVisible();
	});
});

test("should navigate to faculty page and header content", async ({ page }) => {
	await page.goto("/");

	// Click faculty link and wait for navigation
	const facultyLink = page.getByRole("link", { name: "FACULTY" });
	await facultyLink.click();
	await page.waitForURL("**/faculty");

	// Verify URL and page content
	expect(page.url()).toContain("/faculty");

	// Verify main heading is visible
	const facultyProfileHeading = page.getByText("Faculty Profile");
	await expect(facultyProfileHeading).toBeVisible();
});

test.describe("Walkthrough Modal Navigation", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
	});
	test("should navigate through all steps and verify content", async ({
		page,
	}) => {
		// Setup
		await page.getByText("How it works").click();

		// Wait for modal to be visible
		const modal = page.getByRole("dialog");
		await modal.waitFor({ state: "visible" });

		// Welcome Page
		await expect(
			page
				.locator("li")
				.filter({ hasText: "Welcome to e-Clinical Cases" })
				.getByRole("img")
		).toBeVisible();
		await expect(page.getByRole("main")).toContainText(
			"Welcome to e-Clinical Cases Solutions"
		);
		await expect(page.getByRole("main")).toContainText(
			"Here are the steps to get started with e-Clinical Cases Solutions."
		);
		await page.getByRole("button", { name: "Next" }).click();

		// Rest of the pages
		async function verifyStep(stepNumber: number, expectedContent: string) {
			const heading = page.getByRole("heading", {
				name: `Step ${stepNumber}.`,
				exact: true,
			});
			await expect(heading).toBeVisible();
			await expect(page.getByText(expectedContent)).toBeVisible();
		}

		const steps = [
			{
				num: 1,
				content: "Enter the basic information",
				image: "registration image",
			},
			{
				num: 2,
				content: "Login in with your verified email",
				image: "sign in image",
			},
			{
				num: 3,
				content: 'Click on the "View Case" button',
				image: "student dashboard image",
			},
			{
				num: 4,
				content:
					"Review the presentation of the current case study. After careful evaluation, proceed to comment on the presentation.",
				image: "case presentation image",
			},
			{
				num: 5,
				content:
					"Comment on the case study based on the case presentation. Comments must be between 150 and 700 characters.",
				image: "case comments image",
			},
			{
				num: 6,
				content: "Compare your response to the teacher's case model answer.",
				image: "case model answer image",
			},
			{
				num: 7,
				content:
					"Read through the teacher's detailed case teaching on the subject. The teaching also contains additional resources for further learning.",
				image: "case teaching image",
			},
			{
				num: 8,
				content:
					"Answer all the multiple choice questions correctly to complete the course and earn your certificate.",
				image: "cme questions image",
			},
			{
				num: 9,
				content: "Give your feedback on the case study.",
				image: "feedback image",
			},
			{
				num: 10,
				content: "Download your certificate.",
				image: "download certificate image",
			},
		] as const;

		for (const step of steps) {
			await verifyStep(step.num, step.content);
			await expect(page.getByAltText(step.image)).toBeVisible();
			await page.getByRole("button", { name: "Next" }).click();
		}
	});

	test("should close modal using X button", async ({ page }) => {
		await page.getByText("How it works").click();

		const modal = page.getByRole("dialog");
		await modal.waitFor({ state: "visible" });

		await page.getByRole("button", { name: "Close modal" }).click();

		// Note: It appears the "modal" doesn't actually disppear so we are using the classes
		// responsbile for hiding the modal to verify that it is hidden
		await expect(modal).toHaveClass(/opacity-0/);
		await expect(modal).toHaveClass(/pointer-events-none/);
		await expect(modal).toHaveClass(/scale-95/);
	});
});
