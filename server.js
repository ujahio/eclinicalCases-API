/* eslint-disable require-jsdoc */
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const { v4: uuidv4 } = require('uuid')
const bcrypt = require('bcryptjs')
const { dynamodb } = require('./app/db/dynamodb.ts')
const { initTables } = require('./app/tables/index.ts')
const app = express()
app.use(fileUpload())
const corsOptions = {
  origin: 'http://localhost:8081',
}

app.use(cors(corsOptions))

// parse requests of content-type - application/json
app.use(bodyParser.json())

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// init tables
initTables(dynamodb)

app.get('/users', async (req, res) => {
  const params = {
    TableName: 'Users',
  }

  try {
    const data = await dynamodb.scan(params).promise()
    const users = data.Items.map((item) => {
      const user = {}
      Object.keys(item).forEach((key) => {
        user[key] = Object.values(item[key])[0]
      })
      return user
    })
    res.status(200).send(users)
  } catch (err) {
    res.status(500).send({ error: err })
  }
})

// simple route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the ECC Backend API.' })
})

// // routes
require('./app/routes/auth.routes.ts')(app)
// require('./app/routes/user.routes')(app)
// require('./app/routes/teacher.routes')(app)

// set port, listen for requests
const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`)
})
