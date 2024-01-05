const express = require("express");
const userController = require('../controllers/userController')

// creating a router
const router = express.Router();


router.get("/authorized", userController.verifyJWT, function (req, res) {
    res.status(200).send("You need to be authenticated to see this page");
})

router.get("/refreshed", userController.verifyRefreshToken, function (req, res) {
    res.status(200).send("You can still see this? Refresh");
})

router.post("/signup", userController.createUser, (req,res)=>{res.status(200).json(res.locals.user)})

router.post("/login", userController.loginUser)

router.post("/logout", userController.logoutUser)

module.exports = router;