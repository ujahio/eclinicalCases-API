require('dotenv').config();

module.exports = {
  secret: process.env.APP_SECRET_KEY,
  MAILER_EMAIL: process.env.MAILER_EMAIL,
  MAILER_PASS: process.env.MAILER_PASS,
};
