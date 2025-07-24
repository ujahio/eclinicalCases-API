import { TeacherCaseStudies } from "./dynamo";

export const archiveCaseStatusCron = new sst.aws.Cron("ArchiveCaseStatusCron", {
	job: {
		handler: "server/lambdas/archiveCaseStatusCron.handler",
		link: [TeacherCaseStudies],
	},
	schedule: "cron(0 0 * * ? *)", // run at midnight every day
});
