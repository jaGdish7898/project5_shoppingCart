const userModel = require('../model/userModel');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validators=require("../validations/validator")
const mongoose=require("mongoose")
const aws=require("./awsController")

const login = async (req, res) => {
    try {

        if(!validators.isValid(req.body)){
            return res.status(400).send({status:false,msg:"request body is emptey"})
        }
        const InputEmail = req.body.email
        const InputPassword = req.body.password
        
        let user = await userModel.findOne({ email: InputEmail});
        if (user) {
            const { _id, name, password } = user
            const isMatched = await bcrypt.compare(InputPassword, password);
            if (!isMatched) {
                return res.status(400).send({ message: "Invalid login credentials" })
            }
            
            const generatedToken = jwt.sign({userId:_id}, "the-legends-key", { expiresIn: '180m' });
            res.header('user-login-key', generatedToken);
            return res.status(200).send({
                Message:"Login successfull !!",
                token: generatedToken,
            });
        } else {
            return res.status(400).send({ status: false, message: "Oops...Invalid credentials" });
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message });
    }
};

module.exports.login=login

const createUser = async (req, res) => { 
   
    try {
        //console.log(req.body.data2)
        let requestBody=JSON.parse(req.body.data)
        let files=req.files
        //console.log(files)
        if(files.length>0){
            var profilePicture = await aws.uploadFile(files[0])
        }
        
        if(!validators.isValid(requestBody)){
            return res.status(400).send({status:false,msg:"request body is emptey"})
        }
        let {fname,lname,email,phone,password,address } =requestBody 
        if(!validators.isValid(fname)){
            return res.status(400).send({status:false,msg:"fname is not valid"})
        }
        if(!validators.isValid(lname)){
            return res.status(400).send({status:false,msg:"lname is not valid"})
        }
        email=email.trim()
        if(!validators.isValid(email)){
            return res.status(400).send({status:false,msg:"email is not valid"})
        }
        if(!validators.isValidEmailSyntax(email)){
            return res.status(400).send({status:false,msg:"email is not valid"})
        }
        let isEmailExist=await userModel.findOne({email})
        if(isEmailExist) return res.status(400).send({status:false,msg:`${email} already registered !!`})

        let profileImage=profilePicture
        if(!validators.isValid(profileImage)){
            return res.status(400).send({status:false,msg:"profileImage is not valid"})
        }
        if(!validators.isValidUrlSyntax(profileImage)){
            return res.status(400).send({status:false,msg:"profileImage syntax not matched"})
        }
        if(!validators.isValid(phone)){
            return res.status(400).send({status:false,msg:"phone is not valid"})
        } 
        if(!validators.isValidPhoneSyntax(phone)){
            return res.status(400).send({status:false,msg:"phone syntax not matched"})
        } 
        
        let isPhoneExist=await userModel.findOne({phone})
        if(isPhoneExist) return res.status(400).send({status:false,msg:`${phone} already registered !!`})

        if(!validators.isValid(password)){
            return res.status(400).send({status:false,msg:"password is not valid"})
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);  

        if(!validators.isValid(address)){
            return res.status(400).send({status:false,msg:"address is not valid"})
        }
        
        const userCreated = await userModel.create({fname,lname,email, profileImage, phone,password:hashedPassword,address});
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
        if(!validators.isValid(req.params.userId) || !validators.isValidObjectId(req.params.userId)){
            return res.status(404).send({ status: false, message: 'Provided userId is not valid' })
        }
        
        if(req.decodeToken._id==!req.params.userId){
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
module.exports.getuserById=getuserById


const updateUserProfile = async (req, res) => { 
    try {
        const requestBody = JSON.parse(req.body.data)
        let files=req.files
        if(files.length>0){
            var profilePicture = await aws.uploadFile(files[0])
        }
        
        if(!validators.isValid(requestBody)){
            return res.status(400).send({status:false,msg:"request body is emptey"})
        }
        if(!validators.isValid(req.params.userId) || !validators.isValidObjectId(req.params.userId)){
            return res.status(404).send({ status: false, message: 'Provided userId is not valid' })
        }
        if(req.decodeToken._id==!req.params.userId){
            return res.status(404).send({ status: false, message: 'Authorization denide !!' })
        }
        let {fname,lname,email,phone,password,address} =requestBody

        if(fname){
            if(!validators.isValid(fname)){
                return res.status(400).send({status:false,msg:"fname is not valid"})
            }
        }
        
        if(lname){
            if(!validators.isValid(lname)){
                return res.status(400).send({status:false,msg:"lname is not valid"})
            }
        }
        
        if(email){
            if(!validators.isValid(email)){
                return res.status(400).send({status:false,msg:"email is not valid"})
            }
            if(!validators.isValidEmailSyntax(email)){
                return res.status(400).send({status:false,msg:"email is not valid"})
            }
        }
        let profileImage=profilePicture
        
        if(profileImage){
            if(!validators.isValid(profileImage)){
                return res.status(400).send({status:false,msg:"profileImage is not valid"})
            }
        }
        
        if(phone){
            if(!validators.isValid(phone)){
                return res.status(400).send({status:false,msg:"phone is not valid"})
            }
        }
        
        if(password){
            if(!validators.isValid(password)){
                return res.status(400).send({status:false,msg:"password is not valid"})
            }
            var salt = await bcrypt.genSalt(10);
            var hashedPassword = await bcrypt.hash(password, salt);
        }
        
        let update={
            fname,
            lname,
            email,
            profileImage,
            phone,
            password:hashedPassword,
        }  
            
        if(address){
            if(address.shipping){
              if(address.shipping.street){
                  if (!validators.isValid(address.shipping.street)) {
                      res.status(400).send({ status: false, Message: "Please provide street name in shipping address" })
                      return
                  }
                  update["address.shipping.street"] = address.shipping.street
              }
                if(address.shipping.city){
                  if (!validators.isValid(address.shipping.city)) {
                      res.status(400).send({ status: false, Message: "Please provide city name in shipping address" })
                      return
                  }
                  update["address.shipping.city"]=address.shipping.city
              }
              if(address.shipping.pincode){
                  if (!validators.isValid(address.shipping.pincode)) {
                      res.status(400).send({ status: false, Message: "Please provide pincode in shipping address" })
                      return
                  }
                  update["address.shipping.pincode"] = address.shipping.pincode
              }
            }
            if(address.billing){
              if(address.billing.street){
                  if (!validators.isValid(address.billing.street)) {
                      res.status(400).send({ status: false, Message: "Please provide street name in billing address" })
                      return
                  }
                  update["address.billing.street"] = address.billing.street
              }
              if(address.billing.city){
                  if (!validators.isValid(address.billing.city)) {
                      res.status(400).send({ status: false, Message: "Please provide city name in billing address" })
                      return
                  }
                  update["address.billing.city"] = address.billing.city
              }
              if(address.billing.pincode){
                  if (!validators.isValid(address.billing.pincode)) {
                      res.status(400).send({ status: false, Message: "Please provide pincode in billing address" })
                      return
                  }
                  update["address.billing.pincode"] = address.billing.pincode
              }
            }
        }
  
        let updatedProfile = await userModel.findOneAndUpdate({ _id: req.params.userId },update,{ new: true })
        res.status(200).send({ status: true, message: "user profile update successfull", data: updatedProfile })

    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, msg: err.message })
    }
}
module.exports.updateUserProfile = updateUserProfile;

// module.exports.userLogin = userLogin;
// module.exports.getuserById = getuserById;
