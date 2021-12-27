const mongoose = require("mongoose");
const userModel = require("../model/userModel");
//func1
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}
//func2
const isValidRequestBody = function (requestBody) {
    return Object.values(requestBody).length > 0
}
//func3
const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}
//func4
const isValidPhoneSyntax = function (value) {
    if (!(/^[6-9]\d{9}$/.test(value))) {
        return false
    }
    return true
}
//func5
const isValidEmailSyntax = function (email) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
}
//func6
const isValidUrlSyntax = (url) => {
    return /(:?^((https|http|HTTP|HTTPS){1}:\/\/)([\w@?^=%&amp;~+#-_.\/]+)+)$/.test(url)
}
const isValidPrice = (price) => {

    if (!(price + 0) === price) {
        return false
    }
    if (!/(:?^(\d+)([.]?\d+)?)$/.test(price)) {
        return false
    }
    return true
}


module.exports = {
    isValid,
    isValidRequestBody,
    isValidObjectId,
    isValidPhoneSyntax,
    isValidUrlSyntax,
    isValidEmailSyntax,
    isValidPrice,
   
}


























