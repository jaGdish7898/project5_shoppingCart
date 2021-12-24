const mongoose=require("mongoose")

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}
module.exports.isValid=isValid

const isValidRequestBody = function (requestBody) {
    return Object.values(requestBody).length > 0
}
module.exports.isValidRequestBody=isValidRequestBody

const isValidObjectId = function(objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
 }
 module.exports.isValidObjectId=isValidObjectId

 const isValidPhoneSyntax = function (value) {
    if (!(/^[6-9]\d{9}$/.test(value))) {
        return false
    }
    return true
}
module.exports.isValidPhoneSyntax =isValidPhoneSyntax 

isValidEmailSyntax=function(email){
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
}
module.exports.isValidEmailSyntax=isValidEmailSyntax

const isValidUrlSyntax=(url)=>{
    return /(:?^((https|http|HTTP|HTTPS){1}:\/\/)([\w@?^=%&amp;~+#-_.\/]+)+)$/.test(url)
}
module.exports.isValidUrlSyntax=isValidUrlSyntax









 