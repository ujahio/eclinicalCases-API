const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.student = require("./student.model");
db.teacher = require("./teacher.model");
db.admin = require("./admin.model");
db.role = require("./role.model");

db.ROLES = ["user", "teacher", "admin"];

module.exports = db;