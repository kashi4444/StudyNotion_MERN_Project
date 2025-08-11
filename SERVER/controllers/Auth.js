const User = require("../models/User");
const Profile = require("../models/Profile")
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {mailSender} =require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate")
require("dotenv").config();
//send OTP
exports.sendotp = async (req, res)=>{
    try{
        //fetching email
        const{email}= req.body;
        //find user
        const checkUserPresent = await User.findOne({email});
        //if user already exist
        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:"User Already registered"
            })
        }
        
        //generate otp
        let otp = otpGenerator.generate(6,{
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars:false
        })

        //check whether generated otp is unique or not
        let result = await OTP.findOne({otp:otp});
        while(result){
            otp = otpGenerator.generate(6,{
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars:false
            })
            result = await OTP.findOne({otp:otp});
        }
        //we will generate an object for an otp
        //we are not sending createdAt so that it would take it by default the present date
        const otpPayload = {email, otp};

        //create an entry for otp
        const otpBody = await OTP.create(otpPayload);

        res.status(200).json({
            success:true,
            message:"OTP sent successfully",
            otp,
        })
    } 
    catch(err){ 
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}

//signup 
exports.signup= async (req,res)=>{
    try{
        //fetching data
        const {firstName, lastName, email, password,confirmPassword, accountType, contactNumber, otp} = req.body;
        //validate data
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success:false,
                message:"All fields are required"
            })
        }

        //match password && confirmPassword
        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Password && Confirm Password value do not match, please try again"
            })
        }
        //check user exist or not
        const existingUser= await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User is Already registered"
            })
        }
        
        //find most recent OTP stored for the user
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1)
   
        if(recentOtp.length === 0){
            return res.status(404).json({
                success:false,
                message:"OTP not found"  
            })
        }else if(otp !== recentOtp[0].otp){
            return res.status(400).json({
                success:false,
                message:"Invalid OTP"
            })
        }

        //Hash Password
        const hashedPassword = await bcrypt.hash(password,10);

        //create entry in DB
        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null
        }); 

        const user = await User.create({
            firstName, 
            lastName, 
            email,
            contactNumber, 
            password:hashedPassword, 
            accountType, 
            additionalDetails:profileDetails._id,
            image: `https://api.dicebear.com/9.x/initials/svg?seed=${firstName} ${lastName}`
        })

        //return res
        return res.status(200).json({
            success:true,
            message:"User is registered successfully",
            user,
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"User cannot be registered. Please try again"
        })
    }
}

//login
exports.login = async(req, res)=>{
    try{
        //fetch data
        const{email, password}= req.body;

        //validation data
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:"All fields are required, please try again"
            })
        }
        //check user exist or not
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registered, please signup first"
            })
        }
        //generate JWT after password matching
        if(await bcrypt.compare(password,user.password)){
            //password matched
            const payload = {
                email: user.email,
                id:user._id,
                accountType:user.accountType
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn:"5h"
            })
            user.token = token;
            user.password = undefined;
            //create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly: true
            }
            res.cookie("token", token, options).status(200).json({
                success:true,
                token,
                user,
                message:"Logged in successfully"
            })
        }else{
            return res.status(401).json({
                success:false,
                message:"Incorrect password"
            })
        } 
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Login Failure, please try again"
        })
    }
}

//change Password
exports.changePassword= async(req, res)=>{
    try{
        const userId = req.user.id;
        const userDetails = await User.findById(userId);
        //fetch data i.e, oldPassword, newPassword, confirmPassword
        const {oldPassword, newPassword} = req.body;
        //validation like below
        if(!oldPassword || !newPassword){
            return res.status(403).json({
                success:false,
                message:"All fields are required, please try again"
            })
        }

        //password matching and no password should be empty
        if(!await bcrypt.compare(oldPassword, userDetails.password)){
            return res.status(400).json({
                success:false,
                message:"Incorrect Password"
            })
        }
        //hash new Password
        const encryptedPassword = await bcrypt.hash(newPassword,10);

        //update password in DB
        const updatedUserDetails = await User.findByIdAndUpdate(
            userId,
            {password : encryptedPassword},
            {new:true}
        );
        //send mail- password updated
        try{
            const emailResponse = await mailSender(
                updatedUserDetails.email,
                "Password for your account has been updated",
                passwordUpdated(
                  updatedUserDetails.email,
                  `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                )
              )
        }
        catch(err){
            return res.status(400).json({
                success:false,
                message:"Error occured while sending mail",
                error:err.message
            })
        }

        //return response
        return res.status(200).json({
            success:true,
            message:"Password Updated Successfully"
        }) 
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Issue in changing password, please try again",
            error: err.message
        })
    }
}