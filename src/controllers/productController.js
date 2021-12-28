const productModel = require("../model/productModel")
const validator = require("../validations/validator")
const mongoose = require("mongoose")
const funcValidators = require("../validations/validator")
const aws = require("./awsController")


const addProduct = async (req, res) => {

  try {
   

  

    let updateBody = req.body.data
    let files = req.files

    if (!(updateBody && files)) {
      return res.status(404).send({ status: false, msg: "create request is empty" })
    }
    if (files) {
      if (files.length > 0) {
        var productImage = await aws.uploadFile(files[0])
      }
    }

    if (updateBody) {
      updateBody = JSON.parse(updateBody)
      if (!funcValidators.isValidRequestBody(requestBody)) {
        return res.status(400).send({ status: false, msg: "request body is emptey" })
      }
    }
    
    let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = requestBody

    if (!funcValidators.isValid(title)) {
      return res.status(400).send({ status: false, msg: "title is not valid" })
    }
    const data = await productModel.findOne({ title })

    if (data) return res.status(400).send({ status: false, msg: "title already used !" })

    if (!funcValidators.isValid(description)) {
      return res.status(400).send({ status: false, msg: "description is not valid" })
    }
    if (!funcValidators.isValid(price)) {
      return res.status(400).send({ status: false, msg: "price is not valid" })
    }
    price = Number(price)
    if (!funcValidators.isValidPrice(price)) {
      return res.status(400).send({ status: false, msg: "price is not valid" })
    }
    if (!(funcValidators.isValid(currencyId) && currencyId === "INR")) {
      return res.status(400).send({ status: false, msg: "currencyId is not valid" })
    }
    if (!(funcValidators.isValid(currencyFormat) && currencyFormat === "₹")) {
      return res.status(400).send({ status: false, msg: `only "₹" is accepted` })
    }
    if (isFreeShipping) {
      if (!(funcValidators.isValid(isFreeShipping) && ["true", "false", true, false].includes(isFreeShipping))) {
        return res.status(400).send({ status: false, msg: "isFreeShipping is not valid" })
      }
    }
    if (style) {
      if (!funcValidators.isValid(style)) {
        return res.status(400).send({ status: false, msg: "style is not valid" })
      }
    }

    if (installments) {
      if (!funcValidators.isValid(installments)) {
        return res.status(400).send({ status: false, msg: "installments is not valid" })
      }
    }
    if (!(funcValidators.isValid(productImage) && funcValidators.isValidUrlSyntax(productImage))) {
      return res.status(400).send({ status: false, msg: "productImage is not valid" })
    }


    const newProductDetails = {
      title,
      description,
      price,
      currencyId,
      currencyFormat,
      isFreeShipping,
      style,
      installments,
      productImage,

    }


    if (Array.isArray(availableSizes) && availableSizes.length > 0) {
      newProductDetails["availableSizes"] = availableSizes
    }
    else if (Array.isArray(availableSizes) && availableSizes.length === 0) {
      return res.status(400).send({ status: false, msg: "availabel sizes not valid" })
    } else if (typeof (availableSizes) === "string" && funcValidators.isValid(availableSizes)) {
      newProductDetails["availableSizes"] = [availableSizes]
    } else {
      return res.status(400).send({ status: false, msg: "please provide available sizes" })
      //come in else when available sizes is not provided or not of type array or string
    }


    const productAdded = await productModel.create(newProductDetails)

    return res.status(201).send({ status: true, message: 'product added successfully !', data: productAdded })

  } catch (err) {
    console.log(err)
    res.status(500).send({ status: false, msg: err.message })
  }


}

const getProductById = async (req, res) => {

  try {

    if (!(funcValidators.isValid(req.params.productId) &&
      funcValidators.isValidObjectId(req.params.productId))) {
      res.status(400).send({ stays: false, msg: "productId is not valid" })
    }

    const product = await productModel.findOne({ _id: req.params.productId, isDeleted: false })
    if (product) {
      return res.status(200).send({ status: true, data: product })
    } else {
      return res.status(404).send({ status: false, data: "no such product exist" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).send({ status: alse, msg: err.message })
  }


}

const getProductsByQuery = async (req, res) => {

  try {

    const filter = {
      isDeleted: false,
    }
    const { size, name, priceGreaterThan, priceLessThan } = req.query

    if (size) {
      filter["availableSizes"] = size
    }
    if (name) {
      filter["title"] = { $regex: name }
    }

    if (priceGreaterThan || priceLessThan) {
      filter["price"] = {}
      if (priceGreaterThan) {
        filter["price"]["$gt"] = priceGreaterThan
      }
      if (priceLessThan) {
        filter["price"]["$lt"] = priceLessThan
      }
    }

    const matchedProducts = await productModel.find(filter).sort({ price: 1 })
    if (matchedProducts.length > 0)
      res.status(200).send({ status: true, data: matchedProducts })
    else
      res.status(400).send({ status: false, msg: "no such product availabel" })


  } catch (err) {
    console.log(err)
    res.status(500).send({ status: alse, msg: err.message })
  }

}


const updateProduct = async (req, res) => {

  try {


    if (!funcValidators.isValid(req.params.productId) || !funcValidators.isValidObjectId(req.params.productId)) {
      return res.status(404).send({ status: false, message: 'Provided productId is not valid' })
    }

    const product = await productModel.findOne({ _id: req.params.productId, isDeleted: false })

    if (!product) return res.status(404).send({ status: false, msg: "product not exist" })

    let updateBody = req.body.data
    let files = req.files

    if (!(updateBody && files)) {
      return res.status(404).send({ status: false, msg: "at least one update parameter is needed" })
    }
    if (files) {
      if (files.length > 0) {
        var productImage = await aws.uploadFile(files[0])
      }
    }

    if (updateBody) {
      updateBody = JSON.parse(updateBody)
    }
    
    const { title, description, price, style, isFreeShipping, availableSizes, installments } = updateBody

    if (title) {
      if (!funcValidators.isValid(title)) {
        return res.status(400).send({ status: false, msg: "title is not valid" })
      }
    }

    const isMatchFound = await productModel.findOne({ title })
    if (isMatchFound) return res.status(400).send({ status: false, msg: "title elready exist !" })

    if (description) {
      if (!funcValidators.isValid(description)) {
        return res.status(400).send({ status: false, msg: "description is not valid" })
      }
    }
    if (price) {
      if (!funcValidators.isValid(price)) {
        return res.status(400).send({ status: false, msg: "price is not valid" })
      }
    }
    if (style) {
      if (!funcValidators.isValid(style)) {
        return res.status(400).send({ status: false, msg: "style is not valid" })
      }
    }

    if (installments) {
      if (!funcValidators.isValid(installments)) {
        return res.status(400).send({ status: false, msg: "installments is not valid" })
      }
    }

    const updateProduct = {
      title,
      description,
      price,
      style,
      installments,
      isFreeShipping: isFreeShipping ? isFreeShipping : false,
      productImage,
    }

    if (availableSizes) {
      if (Array.isArray(availableSizes) && availableSizes.length > 0) {
        updateProduct["availableSizes"] = availableSizes
      }
      else if (Array.isArray(availableSizes) && availableSizes.length === 0) {
        return res.status(400).send({ status: false, msg: "availabel sizes not valid" })
      } else if (typeof (availableSizes) === "string" && funcValidators.isValid(availableSizes)) {
        updateProduct["availableSizes"] = [availableSizes]
      } else {
        return res.status(400).send({ status: false, msg: "please provide valid available sizes" })
        //come in else when available sizes is not provided or not of type array or string
      }
    }

    const updatedProduct = await productModel.findOneAndUpdate({ _id: req.params.productId }, updateProduct, { new: true })

    if (updatedProduct) {
      res.status(200).send({ status: true, data: updatedProduct })
    } else {
      res.status(404).send({ status: false, msg: "no such product exist" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).send({ status: false, msg: err.message })
  }
}

const deleteProductById = async (req, res) => {
       
  try {
    if (!(funcValidators.isValid(req.params.productId) &&
      funcValidators.isValidObjectId(req.params.productId))) {
     return res.status(404).send({ status: false, msg: "productId is not valid" })
    }
  
  
    const deletedProduct = await productModel.findOneAndUpdate({ _id: req.params.productId, isDeleted: false }, { isDeleted: true, deletedAt: new Date() }, { new: true })

    if (deletedProduct) {
      return res.status(200).send({ status: true, deletedProduct })
    } else {
      return res.status(404).send({ status: false, msg: "no such product exist" })
    }
  }
  catch (err) {
    console.log(err)
    res.status(500).send({ status: false, msg: err.message })
  }
}


module.exports = {
  addProduct,
  getProductById,
  getProductsByQuery,
  updateProduct,
  deleteProductById
}



