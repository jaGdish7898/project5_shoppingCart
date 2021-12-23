
const jwt = require('jsonwebtoken')
const tokenCheacker = function (req, res, next) {
    try {
        let token = req.headers['user-login-key']
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