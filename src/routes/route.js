const express = require('express');
const router = express.Router();


const userController = require("../controllers/userController")
const productController=require("../controllers/productController")
const cartController=require("../controllers/cartController")
const middleware=require("../middleware/tokenChecker")

//------------------user--------------------------------------------//

//user registration 
router.post("/register",userController.createUser)
//login
router.post("/login",userController.login)
//grt user profile
router.get("/user/:userId/profile",middleware.tokenCheacker,userController.getuserById)
//update user profile
router.put("/user/:userId/profile",middleware.tokenCheacker,userController.updateUserProfile)

//------------------product--------------------------------------------//


//1) post products
router.post("/products",productController.addProduct)

//2)get product by id
router.get("/products/:productId",productController.getProductById)

//3)get product by query
router.get("/products",productController.getProductsByQuery)

//4)update by id
router.put("/products/:productId",productController.updateProduct)

//5)delete product by id 
router.delete("/products/:productId",productController.deleteProductById)

//------------------cart--------------------------------------------//

//1)add to cart
router.post("/users/:userId/cart",middleware.tokenCheacker,cartController.addCart)

//2)
router.get("/users/:userId/cart",middleware.tokenCheacker,cartController.getCart)

//3)
router.delete("/users/:userId/cart",middleware.tokenCheacker,cartController.deleteCart)

//4)updatecart
router.put("/users/:userId/cart",middleware.tokenCheacker,cartController.updateCart)

module.exports = router;