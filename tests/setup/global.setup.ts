// Generated from specs/student-registration-test-plan.md — global setup
import { FullConfig } from "@playwright/test";
import { seedTeacher } from "../helpers/cognito";

async function globalSetup(config: FullConfig) {
  console.log("🌱 Seeding teacher user...");
  const teacher = await seedTeacher();
  process.env.TEACHER_EMAIL = teacher.email;
  process.env.TEACHER_PASSWORD = teacher.password;
  console.log(`✅ Teacher seeded: ${teacher.email}`);
}

export default globalSetup;
