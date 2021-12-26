const userModel = require('../model/userModel');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const funcValidators = require("../validations/validator")
const mongoose = require("mongoose")
const aws = require("./awsController")

const login = async (req, res) => {
    try {

        if (!funcValidators.isValidRequestBody(req.body)) {
            return res.status(400).send({ status: false, msg: "request body is emptey" })
        }
        const { email: InputEmail, password: InputPassword } = req.body

        let user = await userModel.findOne({ email: InputEmail });

        if (!user) return res.status(400).send({ message: "invalid login credentials" })

        const { _id, password } = user
        const isMatched = await bcrypt.compare(InputPassword, password);
        if (!isMatched) {
            return res.status(400).send({ message: "Invalid login credentials" })
        }

        const generatedToken = jwt.sign({ userId: _id }, "the-legends-key", { expiresIn: '180m' });
        res.header('user-login-key', generatedToken);
        return res.status(200).send({
            Message: "Login successfull !!",
            token: generatedToken,
        });

    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message });
    }
};

module.exports.login = login

const createUser = async (req, res) => {

    try {

        let requestBody = JSON.parse(req.body.data)
        let files = req.files

        if (files.length > 0) {
            var profileImage = await aws.uploadFile(files[0])
        }

        if (!funcValidators.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, msg: "request body is emptey" })
        }
        let { fname, lname, email, phone, password, address } = requestBody
        if (!funcValidators.isValid(fname)) {
            return res.status(400).send({ status: false, msg: "fname is not valid" })
        }
        if (!funcValidators.isValid(lname)) {
            return res.status(400).send({ status: false, msg: "lname is not valid" })
        }
        if (!funcValidators.isValid(email)) {
            return res.status(400).send({ status: false, msg: "email is not valid" })
        }
        email = email.trim()
        if (!funcValidators.isValidEmailSyntax(email)) {
            return res.status(400).send({ status: false, msg: "email is not valid" })
        }
        const isEmailExist = await userModel.findOne({ email })
        if (isEmailExist) return res.status(400).send({ status: false, msg: `${email} already registered !!` })

        if (!funcValidators.isValid(profileImage)) {
            return res.status(400).send({ status: false, msg: "profileImage is not valid" })
        }
        if (!funcValidators.isValidUrlSyntax(profileImage)) {
            return res.status(400).send({ status: false, msg: "profileImage syntax not matched" })
        }
        if (!funcValidators.isValid(phone)) {
            return res.status(400).send({ status: false, msg: "phone is not valid" })
        }
        if (!funcValidators.isValidPhoneSyntax(phone)) {
            return res.status(400).send({ status: false, msg: "phone syntax not matched" })
        }

        let isPhoneExist = await userModel.findOne({ phone })
        if (isPhoneExist) return res.status(400).send({ status: false, msg: `${phone} already registered !!` })

        if (!funcValidators.isValid(password)) {
            return res.status(400).send({ status: false, msg: "password is not valid" })
        }
        //address has so many fields, let mongoose also do some work ,add ka sara validation mongoose dekhalega
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userCreated = await userModel.create({ fname, lname, email, profileImage, phone, password: hashedPassword, address });
        return res.status(201).send({ status: true, message: 'Success', data: userCreated });
    }
    catch (err) {
        console.log(err)
        res.status(500).send(err.message)
    }
}
module.exports.createUser = createUser;




const getuserById = async (req, res) => {
    try {
        if (!funcValidators.isValid(req.params.userId) || !funcValidators.isValidObjectId(req.params.userId)) {
            return res.status(404).send({ status: false, message: 'Provided userId is not valid' })
        }

        if ((req.decodeToken.userId).toString()!== req.params.userId) {
            return res.status(404).send({ status: false, message: 'Authorization denide !!' })
        }

        const user = await userModel.findById(req.params.userId)
        if (!user) {
            return res.status(404).send({ status: false, message: 'profile does not exist' })
        }

        return res.status(200).send({ status: true, message: 'user profile details', data: user })
    } catch (error) {
        return res.status(500).send({ success: false, error: error.message });
    }
}
module.exports.getuserById = getuserById


const updateUserProfile = async (req, res) => {
    try {
        const requestBody = JSON.parse(req.body.data)
        let files = req.files
        if (files.length > 0) {
            var profileImage = await aws.uploadFile(files[0])
        }
        if (!funcValidators.isValid(req.params.userId) || !funcValidators.isValidObjectId(req.params.userId)) {
            return res.status(404).send({ status: false, message: 'Provided userId is not valid' })
        }
        const user=await userModel.findById(req.params.userId)

        if(!user) return res.status(404).send({ status: false, msg: "profile not exist" })

        if ((req.decodeToken.userId ).toString()!== req.params.userId) {
            return res.status(404).send({ status: false, message: 'Authorization denide !!' })
        }

        if (!funcValidators.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, msg: "request body is emptey" })
        }
        let { fname, lname, email, phone, password, address } = requestBody

        if (fname) {
            if (!funcValidators.isValid(fname)) {
                return res.status(400).send({ status: false, msg: "fname is not valid" })
            }
        }

        if (lname) {
            if (!funcValidators.isValid(lname)) {
                return res.status(400).send({ status: false, msg: "lname is not valid" })
            }
        }
       

        if (email) {
            if (!funcValidators.isValid(email)) {
                return res.status(400).send({ status: false, msg: "email is not valid" })
            }
            if (!funcValidators.isValidEmailSyntax(email)) {
                return res.status(400).send({ status: false, msg: "email is not valid" })
            }
        }

        if (profileImage) {
            if (!funcValidators.isValid(profileImage)) {
                return res.status(400).send({ status: false, msg: "profileImage is not valid" })
            }
            if (!funcValidators.isValidUrlSyntax(profileImage)) {
                return res.status(400).send({ status: false, msg: "profileImage syntax not matched" })
            }
        }

        if (phone) {
            if (!funcValidators.isValid(phone)) {
                return res.status(400).send({ status: false, msg: "phone is not valid" })
            }
        }

        if (password) {
            if (!funcValidators.isValid(password)) {
                return res.status(400).send({ status: false, msg: "password is not valid" })
            }
            var salt = await bcrypt.genSalt(10);
            var hashedPassword = await bcrypt.hash(password, salt);
        }

        let update = {
            fname,
            lname,
            email,
            profileImage,
            phone,
            password: hashedPassword,
        }

        if (address) {
            if (address.shipping) {
                if (address.shipping.street) {
                    if (!funcValidators.isValid(address.shipping.street)) {
                        res.status(400).send({ status: false, Message: "Please provide street name in shipping address" })
                        return
                    }
                    update["address.shipping.street"] = address.shipping.street
                }
                if (address.shipping.city) {
                    if (!funcValidators.isValid(address.shipping.city)) {
                        res.status(400).send({ status: false, Message: "Please provide city name in shipping address" })
                        return
                    }
                    update["address.shipping.city"] = address.shipping.city
                }
                if (address.shipping.pincode) {
                    if (!funcValidators.isValid(address.shipping.pincode)) {
                        res.status(400).send({ status: false, Message: "Please provide pincode in shipping address" })
                        return
                    }
                    update["address.shipping.pincode"] = address.shipping.pincode
                }
            }
            if (address.billing) {
                if (address.billing.street) {
                    if (!funcValidators.isValid(address.billing.street)) {
                        res.status(400).send({ status: false, Message: "Please provide street name in billing address" })
                        return
                    }
                    update["address.billing.street"] = address.billing.street
                }
                if (address.billing.city) {
                    if (!funcValidators.isValid(address.billing.city)) {
                        res.status(400).send({ status: false, Message: "Please provide city name in billing address" })
                        return
                    }
                    update["address.billing.city"] = address.billing.city
                }
                if (address.billing.pincode) {
                    if (!funcValidators.isValid(address.billing.pincode)) {
                        res.status(400).send({ status: false, Message: "Please provide pincode in billing address" })
                        return
                    }
                    update["address.billing.pincode"] = address.billing.pincode
                }
            }
        }

        let updatedProfile = await userModel.findOneAndUpdate({ _id: req.params.userId }, update, { new: true })
        res.status(200).send({ status: true, message: "user profile update successfull", data: updatedProfile })

    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, msg: err.message })
    }
}
module.exports.updateUserProfile = updateUserProfile;

// module.exports.userLogin = userLogin;
// module.exports.getuserById = getuserById;
