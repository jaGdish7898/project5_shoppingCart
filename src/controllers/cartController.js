const cartModel=require("../model/cartModel")
const funcValidators = require("../validations/validator")
const userModel = require('../model/userModel');
const productModel = require("../model/productModel");
const { findOneAndUpdate } = require("../model/userModel");

const addCart=async (req,res)=>{
    try{


    if(!funcValidators.isValidObjectId(req.params.userId)){
        res.status(400).send({status:false,msg:"userid is not valid"})
    }
    if ((req.decodeToken.userId ).toString()!== req.params.userId) {
        return res.status(400).send({ status: false, message: `userId in body doesn't match with the userId in token` })
    }

    const isUserExist=await userModel.findById(req.params.userId)
    if(!isUserExist) return res.status(404).send({ status: false, msg: "user profile not existt" })

    if(!funcValidators.isValidRequestBody(req.body)){
        res.status(400).send({status:false,msg:"Request body is not valid"})
    }
    const {cartId,productId,quantity}=req.body

    if(!funcValidators.isValidObjectId(cartId)){
        res.status(400).send({status:false,msg:"provided cartId is not valid"})
    }
    if(!funcValidators.isValidObjectId(productId)){
        res.status(400).send({status:false,msg:"provided productId is not valid"})
    }
    if(!funcValidators.isValid(quantity)){
        res.status(400).send({status:false,msg:"provided quantity is not valid"})
    }
    
  
    // //---checking if poduct exist-----//
    const isProductExist=await productModel.findOne({_id:productId,isDeleted:false})
    if(!isProductExist) return res.status(404).send({ status: false, msg: "product no  more available" })

    const {price}=isProductExist
    // //---checking if cart exist-----//
    
    const isCartExist=await cartModel.findById(cartId)

    if(!isCartExist){ 
        let totalPrice=Number(price)*Number(quantity)
    
        let newCart=await cartModel.create({userId:req.params.userId,items:[{productId,quantity}],totalPrice,totalItems:1})
    } else{

        let {totalPrice}=isCartExist
        totalPrice=totalPrice+(Number(price)*Number(quantity))
        
        const newProduct={productId,quantity}
        const updatedCart= await cartModel.findOneAndUpdate({_id:cartId},{ $push:{items:newProduct} ,totalPrice},{new:true})
        res.status(200).send({status:true,data:updatedCart})
    }

    }catch(err){
        console.log(err)
    }
}










module.exports={
    addCart
}

