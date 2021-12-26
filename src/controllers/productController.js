const productModel = require("../model/productModel")
const validator = require("../validations/validator")
const mongoose = require("mongoose")
const funcValidators = require("../validations/validator")
const aws = require("./awsController")


const addProduct = async (req, res) => {

  try {
    let requestBody = JSON.parse(req.body.data)
    let files = req.files

    if (files.length > 0) {
      var productImage = await aws.uploadFile(files[0])
    }

    if (!funcValidators.isValidRequestBody(requestBody)) {
      return res.status(400).send({ status: false, msg: "request body is emptey" })
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
    if (!(funcValidators.isValid(availableSizes))) {
      return res.status(400).send({ status: false, msg: "availableSizes is not valid" })
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
      availableSizes,
      installments,
      productImage
    }

    const productAdded = await productModel.create(newProductDetails)

    return res.status(201).send({ status: true, message: 'Success', data: productAdded })

  } catch (err) {
    console.log(err)
    res.status(500).send({ status: false, msg: err.message })
  }


}
module.exports = {
  addProduct
}

