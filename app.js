const express = require('express')
const app = express()
app.use(express.json())

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
let db = null

const path = require('path')
const dbpath = path.join(__dirname, 'twitterClone.db')

const bcrypt = require('bcrypt')

const connectionWithServer = async () => {
  try {
    db = open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000')
    })
  } catch (e) {
    console.log(`The error message is ${e}`)
    process.exit(1)
  }
}
connectionWithServer()

app.post('/register/', async (request, response) => {
  const {username, password, name, gender} = request.body
  const userCheck = `
        SELECT * FROM user WHERE username LIKE '${username}';
  `
  const resCheck = await db.get(userCheck)
  if (resCheck === undefined) {
    if (password.length < 6) {
      response.status(400)
      response.send('Password is too short')
    } else {
      const hashedPassword = await bcrypt.hash(password, 10)
      const instUser = `
            INSERT INTO user(username,password,name,gender)
            VALUES('${username}','${hashedPassword}','${name}','${gender}');
      `
      const insRun = await db.run(instUser)
      response.status(200)
      response.send('User created successfully')
    }
  } else {
    response.status(400)
    response.send('User already exists')
  }
})