const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

//reset passwordToken- It basically generates a link on going to which you can easily rest your passsword
exports.resetPasswordToken = async(req,res)=>{
    try{
        //get email from token
        const {email} = req.body;
    
        //check user for this email and validate email
        const user = await User.findOne({email : email});
        if(!user){
            return res.status(400).json({
                success:false,
                message:"Your email is not registered with us"
            })
        }
    
        //generate token
        const token = crypto.randomUUID();
    
        //update user by adding token and expiration time
        const updateDetails= await User.findOneAndUpdate(
            {email: email},
            {token: token,
                resetPasswordExpires: Date.now() + 5*60*1000
            },
            {new:true}  //this will help in providing the updated document instead of providing the older one
        )
    
        //create url
        const url =`http://localhost:3000/update-password/${token}`;
    
        //send mail containing the url
        await mailSender( email, "Reset Password Link", `Password Reset Link is ${url}`);
        //return response
        return res.status(200).json({
            success:true,
            message:"Email sent successfully, please check email and change password",
            updateDetails
        }) 
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:true,
            message:"Something went wrong in sending reset password mail"
        });
    }  
}

//reset password- it is page on which you can reset your password in DB
exports.resetPassword = async (req,res)=>{
    try{
        //data fetch
        //here token is arrived in body because frontend has pushed it into the body
        const {token, password, confirmPassword}= req.body;

        //validation
        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Password not matching"
            })
        }

        //get user datails from db using token
        const userDetails = await User.findOne({token: token})

        //if no entry - invalid token
        if(!userDetails){
            return res.status(400).json({
                success:false,
                message:"Invalid Token"
            })
        }

        //token time check
        if(userDetails.resetPasswordExpires < Date.now()){
            return res.status(400).json({
                success:false,
                message:"Token is expired, please regenerate your token"
            })
        }

        //hash password
        const hashedPassword = await bcrypt.hash(password,10);

        //update password
        await User.findOneAndUpdate(
            {token:token},
            {password:hashedPassword},
            {new:true}
        )

        //return response
        return res.status(200).json({
            success:true,
            message:"Password Reset Successfully"
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:true,
            message:"Something went wrong in resetting password"
        });
    }
}