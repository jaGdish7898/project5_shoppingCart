const express = require('express');
const router = express.Router();


const userController = require("../controllers/userController")

const middleware=require("../middleware/tokenChecker")


//user registration 
router.post("/register",userController.createUser)
//login
router.post("/login",userController.login)
//grt user profile
router.get("/user/:userId/profile",middleware.tokenCheacker,userController.getuserById)
//update user profile
router.put("/user/:userId/profile",middleware.tokenCheacker,userController.updateUserProfile)





module.exports = router;