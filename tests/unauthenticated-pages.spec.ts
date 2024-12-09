import { test, expect } from "@playwright/test";

const protectedRoutes = [
	"/teacher/dashboard",
	"/teacher/cases",
	"/teacher/case-studies/create",
	"/teacher/case-studies/update",
	"/student/dashboard",
	"/student/certificates",
	"/student/case-studies",
];

for (const route of protectedRoutes) {
	test(`ensure an unauthenticated user is redirected to the login page when accessing ${route}`, async ({
		page,
	}) => {
		await page.goto(route);

		// Assert that we're redirected to the login page
		await expect(page).toHaveURL(/login/);

		// Additional assertions to verify login state
		await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();

		// Verify the original URL is preserved in the callback
		await expect(page).toHaveURL(
			new RegExp(
				`callbackUrl=${encodeURIComponent(`http://localhost:3000${route}`)}`
			)
		);
	});
}
