const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const {mailSender} = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");
const CourseProgress = require("../models/CourseProgress");

//Step-1 : Create order
//initiate the razorpay 
exports.capturePayment = async(req, res)=>{
    const {courses} =req.body;
    const {userId}= req.user.id;
    if(courses.length === 0){
        return res.json({
            success: false,
            message:"Please Provide Course Id"
        });
    }

    let totalAmount =0;
    for(const course_id of courses){
        let course ;
        try{
            course = await Course.findById(course_id);
            if(!course){
                return res.status(500).json({
                    success:false,
                    message:"Could not find the course"
                })
            }

            const uid = new mongoose.Types.ObjectId(userId);
            if(course.studentsEnrolled.includes(uid)){
                return res.status(500).json({
                    success:false,
                    message:"Students is already enrolled"
                })
            }

            totalAmount += course.price;

        }
        catch(err){
            console.log(err);
            return res.status(500).json({
                success:false,
                message:err.message
            })

        }
    }
    const currency ="INR";
    const options ={
        amount : totalAmount * 100,
        currency,
        receipt : Math.random(Date.now()).toString()
    }

    try{
        const paymentResponse = await instance.orders.create(options);
        res.json({
            success:true,
            message:paymentResponse,
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Could not Initiate Order"
        })
    }
}
 
//Step-2 : Payment Verification
//payment Verification
exports.verifyPayment = async(req, res)=>{
    const razorpay_order_id = req.body?.razorpay_order_id;
    const razorpay_payment_id = req.body?.razorpay_payment_id;
    const razorpay_signature = req.body?.razorpay_signature;
    const courses = req.body?.courses;
    const userId = req.user.id;

    if(!razorpay_order_id|| !razorpay_payment_id || !razorpay_signature || !courses || !userId){
        return res.status(400).json({
            success:false,
            message:"Payment Failed"
        })
    }
    let body =razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex");

    if(expectedSignature === razorpay_signature){
        //now enroll the student
        await enrollStudents(courses, userId, res);

        //return res
        return res.status(200).json({
            success:true,
            message:"Payment Verified"
        })
    }
    return res.status(400).json({
        success:false,
        message:"Payment Failed"
    })
}

const enrollStudents = async(courses, userId, res)=>{

    if(!courses || !userId){
        return res.status(400).json({
            success:false,
            message:"Please provide data for courses or userId"
        })
    }

    for(const courseId of courses){
        try{
            //find the course and enroll the student in it
            const enrolledCourse = await Course.findOneAndUpdate(
                {_id:courseId},
                {
                    $push:{studentsEnrolled: userId}
                },
                {new:true}
            )
    
            if(!enrolledCourse){
                return res.status(500).json({
                    success:false,
                    message:"Course Not Found"
                });
            }

            //Assigning a zero progress of the course to the student after purchasing the course
            const courseProgress = await CourseProgress.create({
                courseID:courseId,
                userId: userId,
                completedVideos:[],
            })
            
            //find the student and add the course to their list of enrolledCourses
            const enrolledStudent = await User.findByIdAndUpdate(userId,
                {
                    $push:{
                        courses: courseId,
                        courseProgress: courseProgress._id
                    }

                },
                {new: true}
            )
    
            //send mail to the student
            const emailResponse = await mailSender(
                enrollStudents.email,
                `Successfully Enrolled into ${enrolledCourse.courseName}`,
                courseEnrollmentEmail(enrolledCourse.courseName, `${enrolledStudent.firstName}`)
            )
            //console.log("Email Sent Successfully", emailResponse.response)
        }
        catch(err){
            console.log(err);
            return res.status(500).json({
                success:false,
                message:err.message,
            })
        }
    }    
}    

exports.sendPaymentSuccessEmail = async(req, res)=>{
    const {orderId, paymentId, amount}= req.body;
    const userId = req.user.id;

    if(!orderId|| !paymentId|| !amount|| !userId){
        return res.status(400).json({
            success:false,
            message:"Please Provide all the fields"
        })
    }

    try{
        //student ko dhundho
        const enrolledStudent = await User.findById(userId);
        await mailSender(
            enrolledStudent.email,
            `Payment Received`,
            paymentSuccessEmail(`${enrolledStudent.firstName}`,amount/100, orderId, paymentId)
        )
    }
    catch(err){
        console.log("Error in sending mail", error);
        return res.status(500).json({
            success:false,
            message:"Could not send email"
        })
    }
}




//capture the payment and initiate the razorpay order
// exports.capturePayment = async(req, res)=>{
//     //get courseId and userId
//     const{courseId}= req.body;
//     const {userId} =  req.user.id;

//     //validation
//     //valid courseId
//     if(!courseId){
//         return res.status(400).json({
//             success:false,
//             message:"Please provide the valid course id"
//         })
//     }

//     //valid course Datail
//     let course;
//     try{
//         course = await Course.findById(courseId);
//         if(!course){
//             return res.status(400).json({
//                 success:false,
//                 message:"Could not find the course"
//             })
//         }
//         //is user already pay for the same
//         //convert userId(in form of string) to object id as the course contains user as their object id
//         const uid = new mongoose.Schema.Types.ObjectId(userId);
//         if(await course.studentsEnrolled.includes(uid)){
//             return res.status(400).json({
//                 success:false,
//                 message:"Student is already enrolled"
//             })
//         }
//     }
//     catch(err){
//         console.error(err);
//         return res.status(500).json({
//             success:false,
//             message:err.message,
//         })
//     }
    
//     //order create
//     const amount = course.price;
//     const currency = "INR";
//     const options ={
//         amount : amount *100,
//         currency,
//         receipt : Math.random(Date.now()).toString(),
//         notes:{
//             courseId: course._id,
//             userId,
//         }
//     }
//     try{
//         //initiate payment using razorpay
//         const paymentRasponse = await instance.orders.create(options);
//         console.log(paymentRasponse);
//         //return response
//         return res.status(200).json({
//             success:true,
//             courseName : course.courseName,
//             courseDecription : course.courseDescription,
//             thumbnail: course.thumbnail,
//             orderId :paymentRasponse.id,
//             currency: paymentRasponse.currency,
//             amount: paymentRasponse.amount,
//         })
//     }
//     catch(err){
//         console.error(err);
//         return res.status(500).json({
//             success:false,
//             message:"Could not initiate order"
//         })
//     }
// }

// //verify signature of razorpay and server
// exports.verifySignature = async(req, res)=>{
//     const webhookSecret = "12345678";
//     const signature = req.headers["x-razorpay-signature"];
//     const shasum = crypto.createHmac("sha256", webhookSecret);
//     shasum.update(JSON.stringify(req.body));
//     const digest = shasum.digest("hex");
    
//     if(signature === digest){
//         console.log("Payment is Authorized");

//         const{courseId, userId} = req.body.payload.payment.entity.notes;

//         try{
//             //fullfill action
//             //find the course and enroll the student in it
//             const enrolledCourse = await Course.findOneAndUpdate(
//                 {_id:courseId},
//                 {$push: {studentsEnrolled: userId}},
//                 {new: true},
//             )
//             //check there should not be any error
//             if(!enrolledCourse){
//                 return res.status(500).json({
//                     success:false,
//                     message:"Course not found"
//                 })
//             }
//             console.log(enrolledCourse);

//             //find the student and add the course to it

//             const enrolledStudent = await User.findOneAndUpdate(
//                 {_id:userId},
//                 {$push : {courses: courseId}},
//                 {new:true}
//             )
//             console.log(enrolledStudent);

//             //send confirmation mail
//             const emailResponse = await mailSender (enrolledStudent.email, "Congratulations from Codehelp", "Congratulations, you are onboarded into new Codehelp Course");

//             console.log(emailResponse);
//             return res.status(200).json({
//                 success:true,
//                 message:"Signature Verified and Course added"
                
//             })

//         }
//         catch(err){
//             console.error(err);
//             return res.status(500).json({
//                 success:false,
//                 message:err.message
//             })
//         }
//     }else{
//         return res.status(400).json({
//             success:false,
//             message:"Invalid Request"
//         })
//     }
// }