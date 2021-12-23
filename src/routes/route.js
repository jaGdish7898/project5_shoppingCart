const express = require('express');
const router = express.Router();


const userController = require("../controllers/userController")
const awsController=require("../controllers/awsController")
const middleware=require("../middleware/tokenChecker")

// router.put("/user/:userId/profile",userController.updateProfile)
router.get("/uploadeToAws-andGetLink",awsController.getFileLink)
router.post("/register",userController.createUser)
router.post("/login",userController.login)
router.get("/user/:userId/profile",middleware.tokenCheacker,userController.getuserById)
router.put("/user/:userId/profile",middleware.tokenCheacker,userController.updateUserProfile)


// //POST FOR USER
// router.post('/register', userController.createUser)

// //POST FOR LOGIN USER
// router.post('/login', userController.loginUser)

// //POST FOR BOOK
// router.post('/books', mid1.mid1,bookController.createBook)

// // get Book
// router.get('/bookslist', mid1.mid1,bookController.getBook)

// //grt books with all reviews
// router.get("/Books/:bookId",mid1.mid1,bookController.getBookWithreview)

// //update Book
// router.put('/books/:bookId', mid1.mid1,bookController.updateBook)

// router.delete('/books/:bookId', mid1.mid1,bookController.deleteById)

// //add review

// router.post('/books/:bookId/review',bookController.addReview)

// //Update review
// router.put('/books/:bookId/review/:reviewId',bookController.updateReview)

// //fdlkjf
// // router.post('/check/:id',bookController.check)



// //delete
// router.delete('/books/:bookId/review/:reviewId',bookController.deleteReview)




module.exports = router;