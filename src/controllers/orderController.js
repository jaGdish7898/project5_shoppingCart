const orderModel=require("../model/orderModel")
const cartModel = require("../model/cartModel")
const funcValidators = require("../validations/validator")
const userModel = require('../model/userModel');
const productModel = require("../model/productModel");


const createOrder=async (req,res)=>{

    try{
        if (!funcValidators.isValidObjectId(req.params.userId)) {
            res.status(400).send({ status: false, msg: "userid is not valid" })
        }
        if ((req.decodeToken.userId).toString() !== req.params.userId) {
            return res.status(400).send({ status: false, message: `userId in body doesn't match with the userId in token` })
        }
    
        const isUserExist = await userModel.findById(req.params.userId)
        if (!isUserExist) return res.status(404).send({ status: false, msg: "user profile not existt" })
    
        if (!funcValidators.isValidObjectId(req.body.cartId)) {
            res.status(400).send({ status: false, msg: "provided cartId is not valid" })
        }
    //---------------------validations end -------------------------//
        
        const cartDetails=await cartModel.findById(req.body.cartId).select({__v:0,createdAt:0,updatedAt:0,_id:0})
       
        let {items}=cartDetails
        let totalQuantity=null
        items.map((product)=>{
            totalQuantity+=(product.quantity)
    
        })
        let order=cartDetails.toObject()
        order.totalQuantity=totalQuantity
        
        let createdOrder=await orderModel.create(order)
        if(createdOrder){
            return res.status(201).send({status:true,msg:"order created successfully !",data:createdOrder})
        }
        else{
            return res.status(400).send({status:true,msg:"order creation failed"})
        }
        
    }
    catch(err){
        console.log(err)
        res.status(500).send({ status: false, msg: err.message })
    }
}


const updateOrder=async (req,res)=>{
    try{

        if (!funcValidators.isValidObjectId(req.params.userId)) {
            return res.status(400).send({ status: false, msg: "userid is not valid" })
        }
        if ((req.decodeToken.userId).toString() !== req.params.userId) {
            return res.status(400).send({ status: false, message: `userId in body doesn't match with the userId in token` })
        }
    
        const isUserExist = await userModel.findById(req.params.userId)
        if (!isUserExist) return res.status(404).send({ status: false, msg: "user profile not existt" })
    
        if (!funcValidators.isValidObjectId(req.body.orderId)) {
            return res.status(400).send({ status: false, msg: "provided orderId is not valid" })
        }

        const orderDetails=await orderModel.findOne({_id:req.body.orderId,isDeleted:false})
        if(!orderDetails){
            return res.status(404).send({ status: false, msg: "no such order exist" })
        }
        const {cancellable,userId}=orderDetails
        if ((userId).toString() !== req.params.userId) {
            return res.status(400).send({ status: false, message: `this order not belongs to the provide user` })
        }

        if(!cancellable){
            return res.status(404).send({ status: false, msg: "order can't be cancelled" })
        }
        const updatedOrder=await orderModel.findOneAndUpdate({_id:req.body.orderId,isDeleted:false},{"status":"cancled",isDeleted:true,deletedAt:new Date()},{new:true})
        if(updatedOrder){
            return res.status(200).send({ status: false, msg: "order updated successfully",data:updatedOrder})
        }
        else{
            return res.status(400).send({ status: false, msg: "order Update failed !" })
        }



    }catch(err){
        console.log(err)
        res.status(500).send({ status: false, msg: err.message })
    }
    
}



module.exports={
    createOrder,
    updateOrder
}