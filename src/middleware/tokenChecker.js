
const jwt = require('jsonwebtoken')
const tokenCheacker = function (req, res, next) {
    try {
        const BearerToken=req.headers.authorization   //BearerToken=(Bearer+tokenValue),seprated by space
        let BearerTokenArr= BearerToken.split(" ")    //but we only need token
        let token = BearerTokenArr[1]
        if (!token) {
            return res.status(401).send({ status: false, msg: "no authentication token" })
        } else {
            let decodeToken = jwt.verify(token, 'the-legends-key')
            if (decodeToken) {
                req.decodeToken = decodeToken
                next()

            } else {
                res.status(401).send({ status: false, msg: "not a valid token" })
            }
        }

    } catch (error) {
        console.log(error)
        res.status(500).send({ status: false, msg: error })
    }


}
module.exports.tokenCheacker=tokenCheacker