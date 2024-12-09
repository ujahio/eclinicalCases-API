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

		await expect(page).toHaveURL(/login/);
	});
}
