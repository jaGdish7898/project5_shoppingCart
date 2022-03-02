
const aws = require("aws-sdk");
//---------------------------------------AWS CONNECTION---------------------------------------------------//

aws.config.update({
  accessKeyId: "AKIAY3L35MCRRMC6253G",  // id
  secretAccessKey: "88NOFLHQrap/1G2LqUy9YkFbFRe/GNERsCyKvTZA",  // like your secret password
  region: "ap-south-1" // Mumbai region
});

//--------------------------------AWS FUNCTION TO UPLOAD THE FILE AND FOR GETTING THE LINK--------------//

// this function uploads file to AWS and gives back the url for the file
let uploadFile = async (file) => {
  return new Promise(function (resolve, reject) { // exactly 
    
    // Create S3 service object
    let s3 = new aws.S3({ apiVersion: "2006-03-01" });
    var uploadParams = {
      ACL: "public-read", // this file is publically readable
      Bucket: "classroom-training-bucket",
      Key: "js_newFolder/"+ file.originalname, 
      Body: file.buffer, 
    };

    // Callback - function provided as the second parameter ( most oftenly)
    s3.upload(uploadParams , function (err, data) {
      if (err) {
        console.log(err)
        return reject( { "error": err });
      }
      // console.log(data)
      // console.log(`File uploaded successfully. ${data.Location}`);

      return resolve(data.Location); //HERE 

    });
  });
};
module.exports.uploadFile=uploadFile

const getFileLink=async (req,res)=>{
    try {
        let files = req.files;
        if (files && files.length > 0) {
          //upload to s3 and return true..incase of error in uploading this will goto catch block( as rejected promise)
          let uploadedFileURL = await uploadFile( files[0] ); // expect this function to take file as input and give url of uploaded file as output 
          res.status(201).send({ status: true, data: uploadedFileURL });
    
        } 
        else {
          res.status(400).send({ status: false, msg: "No file to write" });
        }
    
      } 
      catch (e) {
        console.log("error is: ", e);
        res.status(500).send({ status: false, msg: "Error in uploading file to s3" });
      }
}

module.exports.getFileLink=getFileLink
