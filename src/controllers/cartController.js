const cartModel = require("../model/cartModel")
const funcValidators = require("../validations/validator")
const userModel = require('../model/userModel');
const productModel = require("../model/productModel");

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
        const { cartId, productId } = req.body

        if (!funcValidators.isValidObjectId(cartId)) {
            res.status(400).send({ status: false, msg: "provided cartId is not valid" })
        }
        if (!funcValidators.isValidObjectId(productId)) {
            res.status(400).send({ status: false, msg: "provided productId is not valid" })
        }
        


        // //---checking if poduct exist-----//
        const isProductExist = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!isProductExist) return res.status(404).send({ status: false, msg: "product no  more available" })

        const { price } = isProductExist
        // //---checking if cart exist-----//

        const isCartExist = await cartModel.findOne({$or:[{_id:cartId},{userId:req.params.userId}]})
        

        if (!isCartExist) {
           
            let totalPrice = Number(price)

            let newCart = await cartModel.create({ userId: req.params.userId, items: [{ productId, quantity:1 }], totalPrice, totalItems: 1})
            if(newCart){
                return res.status(201).send({status:true,data:newCart})
            }else{
                return res.status(400).send({status:true,msg:"bad Request"})
            }
        } else {
            let { totalPrice, items ,totalItems} = isCartExist
            let matchedItem=null
            items.map((product)=>{
                if(productId===String(product.productId)){
                    matchedItem=product
                }
            })
           if(matchedItem){

                let {quantity:productQuantity}=matchedItem
                let newQuantity=Number(productQuantity)+1
                totalPrice=totalPrice+price
                let updatedCart=await cartModel.findOneAndUpdate({$or:[{_id:cartId},{userId:req.params.userId}] ,"items.productId":productId }, { $set:{"items.$.quantity":newQuantity}, totalPrice }, { new: true })
                return res.status(201).send({status:true,data:updatedCart})
            }else{
                totalPrice = totalPrice + Number(price)
                totalItems+=1
                
                const newProduct = { productId, quantity:1 }
                const updatedCart = await cartModel.findOneAndUpdate({$or:[{_id:cartId},{userId:req.params.userId}]}, { $push: { items: newProduct }, totalPrice, totalItems }, { new: true })
                return res.status(201).send({ status: true, data: updatedCart })
            }}
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

        const cartDetail = await cartModel.findOne({ userId: req.params.userId }).select({ createdAt: 0, updatedAt: 0, __v: 0 })

        //.select({_id:0,items:1,totalPrice:1})

        if (cartDetail) {
            return res.status(200).send({ status: true, data: cartDetail })
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
        // res.send("done")
        let {items,totalItems,totalPrice}=isCartExist
        // let newItems=[]
        let matchedItem=null
        for(let product of items){
            if(productId===String(product.productId)){
                matchedItem=product
            }
            // else{
            //     newItems.push(product)
            // }
        }

        if(removeProduct===0){
            let {quantity}=matchedItem
            totalItems-=1;
            totalPrice=totalPrice-(price*quantity)
            // let updatedCart=await cartModel.findOneAndUpdate({_id:cartId},{items:newItems,totalItems,totalPrice},{new:true})
            
            let updatedCart=await cartModel.findOneAndUpdate({_id:cartId},{$pull:{items:{productId}},totalItems,totalPrice},{new:true})
            res.send(updatedCart)
        }else{
            // totalPrice=totalPrice-(price)
            let {quantity}=matchedItem
            let newQuantity=quantity-1
            if(newQuantity===0){
                totalPrice=totalPrice-(price)
                totalItems-=1
                let updatedCart=await cartModel.findOneAndUpdate({_id:cartId},{$pull:{items:{productId}},totalItems,totalPrice},{new:true})
                return res.send(updatedCart)
            }
            totalPrice=totalPrice-(price)
            let updatedCart=await cartModel.findOneAndUpdate({_id:cartId,"items.productId":productId},{ $set:{"items.$.quantity":newQuantity},totalPrice},{new:true})
            return res.send(updatedCart)
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
    updateCart,
   
}

