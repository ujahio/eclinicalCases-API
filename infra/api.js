import { bucket } from "./storage";
import { JWT_SECRET, PASS_SECRET } from "./secrets";
import { Users, Cases, Feedback, Answers, Certificates, StudentCaseAttempts } from "./dynamo";

const links = [
  Users,
  Cases,
  Feedback,
  Answers,
  Certificates,
  StudentCaseAttempts,
  JWT_SECRET,
  PASS_SECRET,
];
export const api = new sst.aws.ApiGatewayV2("MyApi");

// Auth
api.route("POST /api/auth/signin", {
  handler: "handler.handler",
  link: links,
});
api.route("POST /api/auth/signup", {
  handler: "handler.handler",
  link: links,
});
api.route("POST /api/auth/send-otp", {
  handler: "handler.handler",
  link: links,
});
api.route("POST /api/auth/reset-password", {
  handler: "handler.handler",
  link: links,
});
api.route("POST /api/auth/update-password", {
  handler: "handler.handler",
  link: links,
});
api.route("GET /api/auth/users", {
  handler: "handler.handler",
  link: links,
});

// Case
// api.route("GET /api/case/details/$default", {
//   handler: "handler.handler",
//   link: links,
// });
// api.route("GET /api/case/all/", {
//   handler: "handler.handler",
//   link: links,
// });
// api.route("GET /api/case/ongoing-case/", {
//   handler: "handler.handler",
//   link: links,
// });
// api.route("POST /api/case/add", {
//   handler: "handler.handler",
//   link: links,
//   link: [bucket]
// });
// api.route("POST /api/case/update/$default", {
//   handler: "handler.handler",
//   link: links,
// });
// api.route("POST /api/case/duplicate", {
//   handler: "handler.handler",
//   link: links,
// });
// api.route("POST /api/case/publish/", {
//   handler: "handler.handler",
//   link: links,
// });
// api.route("POST /api/case/add/feedback/", {
//   handler: "handler.handler",
//   link: links,
// });
// api.route("GET /api/case/feedbacks/$default", {
//   handler: "handler.handler",
//   link: links,
// });
// api.route("GET /api/case/responses/$default", {
//   handler: "handler.handler",
//   link: links,
// });
// api.route("GET /api/case/data/$default", {
//   handler: "handler.handler",
//   link: links,
// });
// api.route("GET /api/case/student/attempts/$default", {
//   handler: "handler.handler",
//   link: links,
// });
// api.route("DELETE /api/case/delete-case/$default", {
//   handler: "handler.handler",
//   link: links,
// });
// api.route("DELETE /api/case/delete/all/", {
//   handler: "handler.handler",
//   link: links,
// });

// // Quiz
// api.route("POST /api/quiz/submit", {
//   handler: "handler.handler",
//   link: links,
// });
// api.route("GET /api/quiz/answers/$default", {
//   handler: "handler.handler",
//   link: links,
// });

// // Student
// api.route("GET /api/student/certificates", {
//   handler: "handler.handler",
//   link: links,
// });
// api.route("GET /api/student/certificate/$default", {
//   handler: "handler.handler",
//   link: links,
// });
