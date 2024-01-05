
const express = require("express")
const cookieParser = require('cookie-parser')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser())

const router = require("./routes/routers.js");
const userController = require('./controllers/userController.js');

app.use("/", router);

//if any verified apps
// app.use('/auth1', userController.verifyJWT)
// app.use('/auth2',  userController.verifyJWT)
// app.use('/auth3',  userController.verifyJWT)


app.listen(8080, function () {
    console.log(`🚀 Listening on port 8080`);
  });