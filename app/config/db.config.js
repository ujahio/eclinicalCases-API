require('dotenv').config()

console.log(process.env.DBPWD)
module.exports = {
  HOST: "localhost",
  PORT: 27017,
  DBPWD: process.env.DBPWD
};