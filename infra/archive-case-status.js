import { TeacherCaseStudies } from "./dynamo";

export const caseStatusCron = new sst.aws.Cron("ArchiveCaseCron", {
	job: {
		handler: "server/lambdas/archiveCaseCron.handler",
		link: [TeacherCaseStudies],
	},
	schedule: "rate(1 minute)",
});
