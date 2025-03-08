const mongoose = require("mongoose");
const {mailSender} = require("../utils/mailSender");
const otpTemplate = require("../mail/templates/emailVerificationTemplate");
const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    otp:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires: 5*60,
    },
})
 
async function sendVerificationEmail(email, otp){
    try{
        console.log("Lets send mail of otp")
        const mailResponse = await mailSender(email, "Verification Email from StudyNotion",otpTemplate(otp));
        console.log("Email sent successfully-: ",mailResponse);
    }
    catch(err){
        console.log("Error occured while sending mail-: ",email);
        throw err;
    }
}

OTPSchema.pre("save", async function (next){
    await sendVerificationEmail(this.email, this.otp);
    next();
})
module.exports = mongoose.model("OTP",OTPSchema);