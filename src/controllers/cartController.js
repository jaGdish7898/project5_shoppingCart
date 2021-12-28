const cartModel = require("../model/cartModel")
const funcValidators = require("../validations/validator")
const userModel = require('../model/userModel');
const productModel = require("../model/productModel");
const { findOneAndUpdate } = require("../model/userModel");

const addCart = async (req, res) => {
    try {


        if (!funcValidators.isValidObjectId(req.params.userId)) {
            res.status(400).send({ status: false, msg: "userid is not valid" })
        }
        if ((req.decodeToken.userId).toString() !== req.params.userId) {
            return res.status(400).send({ status: false, message: `userId in body doesn't match with the userId in token` })
        }

        const isUserExist = await userModel.findById(req.params.userId)
        if (!isUserExist) return res.status(404).send({ status: false, msg: "user profile not existt" })

        if (!funcValidators.isValidRequestBody(req.body)) {
            res.status(400).send({ status: false, msg: "Request body is not valid" })
        }
        const { cartId, productId, quantity } = req.body

        if (!funcValidators.isValidObjectId(cartId)) {
            res.status(400).send({ status: false, msg: "provided cartId is not valid" })
        }
        if (!funcValidators.isValidObjectId(productId)) {
            res.status(400).send({ status: false, msg: "provided productId is not valid" })
        }
        if (!funcValidators.isValid(quantity)) {
            res.status(400).send({ status: false, msg: "provided quantity is not valid" })
        }


        // //---checking if poduct exist-----//
        const isProductExist = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!isProductExist) return res.status(404).send({ status: false, msg: "product no  more available" })

        const { price } = isProductExist
        // //---checking if cart exist-----//

        const isCartExist = await cartModel.findById(cartId)

        if (!isCartExist) {
            let totalPrice = Number(price) * Number(quantity)

            let newCart = await cartModel.create({ userId: req.params.userId, items: [{ productId, quantity }], totalPrice, totalItems: 1 })
        } else {

            let { totalPrice, items } = isCartExist
            totalPrice = totalPrice + (Number(price) * Number(quantity))
            totalItems = items.length + 1

            const newProduct = { productId, quantity }
            const updatedCart = await cartModel.findOneAndUpdate({ _id: cartId }, { $push: { items: newProduct }, totalPrice, totalItems }, { new: true })
            res.status(200).send({ status: true, data: updatedCart })
        }

    } catch (err) {
        console.log(err)
    }
}


const getCart = async (req, res) => {

    try {

        if (!funcValidators.isValidObjectId(req.params.userId)) {
            res.status(400).send({ status: false, msg: "userid is not valid" })
        }
        if ((req.decodeToken.userId).toString() !== req.params.userId) {
            return res.status(400).send({ status: false, message: `userId doesn't match with the userId in token` })
        }

        const isUserExist = await userModel.findById(req.params.userId)
        if (!isUserExist) return res.status(404).send({ status: false, msg: "user profile not existt" })

        const productDetail = await cartModel.findOne({ userId: req.params.userId }).select({ createdAt: 0, updatedAt: 0, __v: 0 })

        //.select({_id:0,items:1,totalPrice:1})

        if (productDetail) {
            return res.status(200).send({ status: true, data: productDetail })
        } else {
            return res.status(404).send({ status: false, msg: `cart doesn't exist` })
        }

    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, msg: err.message })
    }

}

const deleteCart = async (req, res) => {
    try {

        if (!funcValidators.isValidObjectId(req.params.userId)) {
            res.status(400).send({ status: false, msg: "userid is not valid" })
        }
        if ((req.decodeToken.userId).toString() !== req.params.userId) {
            return res.status(400).send({ status: false, message: `userId doesn't match with the userId in token` })
        }

        const isUserExist = await userModel.findById(req.params.userId)
        if (!isUserExist) return res.status(404).send({ status: false, msg: "user profile not existt" })

        const deletedCart = await cartModel.findOneAndUpdate({ userId: req.params.userId }, { items: [], totalItems: 0, totalPrice: 0 }, { new: true })

        if (deletedCart) {
            return res.status(204).send({ status: true, data: deletedCart })
        } else {
            return res.status(404).send({ status: false, msg: `cart doesn't exist` })
        }

    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, msg: err.message })
    }
}

const updateCart = async (req, res) => {
    try {
        if (!funcValidators.isValidObjectId(req.params.userId)) {
            res.status(400).send({ status: false, msg: "userid is not valid" })
        }
        if ((req.decodeToken.userId).toString() !== req.params.userId) {
            return res.status(400).send({ status: false, message: `userId doesn't match with the userId in token` })
        }

        const isUserExist = await userModel.findById(req.params.userId)
        if (!isUserExist) return res.status(404).send({ status: false, msg: "user profile does not exist" }) 

        if (!funcValidators.isValidRequestBody(req.body)) {
            res.status(400).send({ status: false, msg: "Request body is not valid" })
        }
        const { cartId, productId, removeProduct } = req.body

        if (!funcValidators.isValidObjectId(cartId)) {
            res.status(400).send({ status: false, msg: "provided cartId is not valid" })
        }
        if (!funcValidators.isValidObjectId(productId)) {
            res.status(400).send({ status: false, msg: "provided productId is not valid" })
        }
        if (!funcValidators.isValid(removeProduct)) {
            res.status(400).send({ status: false, msg: "removeProduct contain invalid value" })
        }

        // //---checking if product exist-----//
        
        const isProductExist = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!isProductExist) return res.status(404).send({ status: false, msg: "product no  more available" })

        let {price}=isProductExist

        // //---checking if cart exist-----//

        const isCartExist = await cartModel.findById(cartId)
        if(!isCartExist){
            return res.status(404).send({ status: false, msg:`cart not exist` })
        }
        if(Number(removeProduct)===0){
            let {items,totalPrice}=isCartExist
            let newItems=[]
            let productToRemove=null
           
            let productQuantity=0
            for(let product of items){
                if(String(product.productId)!==String(productId)){
                    newItems.push(product)
                }else{
                    productToRemove=product
                    productQuantity+=product.quantity
                }
            }
            
            if(!productToRemove) return res.status(400).send({status:false,msg:"this product is not present in cart"})
            let newTotalPrice=totalPrice-(price*productQuantity)
            let totalItems=newItems.length

           const updatedCart=await cartModel.findOneAndUpdate({_id:cartId},{items:newItems,totalPrice:newTotalPrice,totalItems},{new:true})

           if(updatedCart)
           return res.status(200).send({status:true,data:updatedCart})
           else
           return res.status(400).send({status:false,msg:"cart update failed !!"})


        }else{

            let {items,totalPrice}=isCartExist
            
            let productToUpdate=null
            let newItems=[]
            let productQuantity=0
            for(let product of items){
                if(String(product.productId)!==String(productId)){
                    newItems.push(newItems)
                }
                else{
                    productToUpdate=product
                }
            }

            if(!productToUpdate) return res.status(400).send({status:false,msg:"this product is not present in cart"})

            

            let {quantity}=productToUpdate
            let newQuantity=Number(quantity)-Number(removeProduct)
            productToUpdate["quantity"]=newQuantity
            newItems.push(productToUpdate)
            let newTotalPrice=totalPrice-(price*Number(removeProduct))

            // const updatedCart=await cartModel.findOneAndUpdate({_id:cartId},{items:newItems,totalPrice:newTotalPrice},{new:true})

           if(updatedCart)
           return res.status(200).send({status:true,data:updatedCart})
           else
           return res.status(400).send({status:false,msg:"cart update failed !!"})






        }   
    
    
    
    
    
    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, msg: err.message })
    }

}



module.exports = {
    addCart,
    getCart,
    deleteCart,
    updateCart
}

