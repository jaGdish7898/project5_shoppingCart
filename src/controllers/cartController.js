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

        const isCartExist = await cartModel.findById(cartId)
        

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
                let updatedCart=await cartModel.findOneAndUpdate({ _id: cartId ,"items.productId":productId }, { $set:{"items.$.quantity":newQuantity}, totalPrice }, { new: true })
                return res.status(201).send({status:true,data:updatedCart})
            }else{
                totalPrice = totalPrice + Number(price)
                totalItems+=1
                
                const newProduct = { productId, quantity:1 }
                const updatedCart = await cartModel.findOneAndUpdate({ _id: cartId }, { $push: { items: newProduct }, totalPrice, totalItems }, { new: true })
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

const updateArray=async (req,res)=>{
    // await cartModel.findOneAndUpdate({_id:"61cb122e2bba34a531adb644"},{$set:{"items.0":{name:"jagdish"}}})
    // await cartModel.findOneAndUpdate({_id:"61cc4e2d55e5601ecce9432d","items.productId":"61c951d314f46d56e2d76c30"},{$set:{"items.$":{name:"jagdish",age:20}},totalPrice:100})
    // await cartModel.findOneAndUpdate({_id:"61cc784f0fdbe043ff4fbbb7"},{$pull:{items:{productId:"61c951d314f46d56e2d76c30"}}})
    console.log(req.body.array)
    let data=await cartModel.findOneAndUpdate({_id:"61cc931a0b54b66ca10e4d3b","array":{name:"c",value:3}},{$set:{"array.$.age":300}},{new:true})
    // let data=await cartModel.findOneAndUpdate({_id:"61cc931a0b54b66ca10e4d3b"},{ array:[{name:"a",age:1,value:1},{name:"b",age:2,value:2},{name:"c",age:3,value:3},{name:"d",age:4,value:4},{name:"e",age:5,value:5}]},{new:true})

    res.send(data)
} 


module.exports = {
    addCart,
    getCart,
    deleteCart,
    updateCart,
    updateArray
}

