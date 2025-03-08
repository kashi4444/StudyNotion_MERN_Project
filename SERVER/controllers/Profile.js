const CourseProgress = require("../models/CourseProgress");
const Profile = require("../models/Profile");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");
const Course = require("../models/Course");
require("dotenv").config();
//here as we have alredy made a profile during signup storing null values so we do not have to again create it we can easily just update it
exports.updateProfile = async(req, res)=>{
    try{
        //get data
        const{
            dateofBirth = "",
            about = "",
            contactNumber = "",
            gender = "",
        }= req.body;
        //get userId
        const id = req.user.id;     //we have find out from here as it we are here after login only and for login we have definitely passed through auth middleware which has inserted id into the user

        //find profile by id
        const userDetails = await User.findById(id);    // as we don't have profile id so we have fetched the complete user details through user id

        const profileId = userDetails.additionalDetails;
        const profile = await Profile.findById(profileId);

        //update profile - we used this method bcz profileDetails is already an object
        profile.dateofBirth = dateofBirth;
        profile.about =about;
        profile.gender = gender;
        profile.contactNumber = contactNumber;
        await profile.save();
        
        //find the updateduserDetails
        const updatedUserDetails = await User.findById(id).populate("additionalDetails").exec();

        //return response
        return res.status(200).json({
            success:true,
            message:"Profile updated successfully",
            updatedUserDetails,
        })

    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:err.message,
        })
    }
}
//TODO[H.W] -: how to schedule that after selecting delete account the account will not delete immediately instead it will delete after some time

//TODO[H.W] -: What is a node cron job

//delete account
exports.deleteAccount = async (req,res)=>{
    try{
        //get id
        const id = req.user.id;
        console.log(id);
        //validation
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }
        //delete profile
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findByIdAndDelete({_id:profileId});

        //TODO[H.W] -: Unenroll user from all enrolled courses

        //delete user
        await User.findByIdAndDelete({_id:id});
        
        //return response
        return res.status(200).json({
            success:true,
            message:"User deleted successfully",
            profileDetails,
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"User account cannot deleted successfully",
            error:err.message,
        })
    }
}

//get All Users Details
exports.getAllUserDetails = async(req,res)=>{
    try{
        //get id
        const id = req.user.id;
        //validation
        const userDetails = await User.findById(id).populate("additionalDetails").exec();
        
        //return response
        return res.status(200).json({
            success:true,
            message:"User data fetched successfully",
            data:userDetails
        })

    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:err.message,
        })
    }
}

//getEnrolledCourses
exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id;
      let userDetails = await User.findOne({
        _id: userId,
      })
        .populate({
          path: "courses",
          populate: {
            path: "courseContent",
            populate: {
              path: "subSection",
            },
          },
        })
        .exec();
      userDetails = userDetails.toObject();
      let SubsectionLength = 0
      for (let i = 0; i < userDetails.courses.length; i++) {
        let totalDurationInSeconds = 0
        SubsectionLength = 0
        for (let j = 0; j < userDetails.courses[i].courseContent.length; j++) {
          totalDurationInSeconds += userDetails.courses[i].courseContent[
            j
          ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
          userDetails.courses[i].totalDuration = convertSecondsToDuration(
            totalDurationInSeconds
          )
          SubsectionLength +=
            userDetails.courses[i].courseContent[j].subSection.length
        }
        let courseProgressCount = await CourseProgress.findOne({
          courseID: userDetails.courses[i]._id,
          userId: userId,
        })
        courseProgressCount = courseProgressCount?.completedVideos.length
        if (SubsectionLength === 0) {
          userDetails.courses[i].progressPercentage = 100
        } else {
          // To make it up to 2 decimal point
          const multiplier = Math.pow(10, 2)
          userDetails.courses[i].progressPercentage =
            Math.round(
              (courseProgressCount / SubsectionLength) * 100 * multiplier
            ) / multiplier
        }
      }
  
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      console.log(error.message)
      return res.status(500).json({
        success: false,
        message: "Course could not be fetched",
      })
    }
  }
  
//updateDisplayPicture
exports.updateDisplayPicture = async(req,res)=>{
    try{
        //fetch userId
        const userId = req.user.id;
        //fetch picture to be uploaded 
        const displayPicture = req.files.displayPicture;

        //validation
        if(!displayPicture){
            return res.status(400).json({
                success:false,
                message:"Provide picture to upload"
            })
        }

        //upload image to cloudinary
        const image = await uploadImageToCloudinary(displayPicture, process.env.FOLDER_NAME,1000,1000);
        console.log(image);
        // console.log(image.secure_url);

        //upadte DB 
        const updatedUserProfile = await User.findByIdAndUpdate({_id:userId},
            {image: image.secure_url},
            {new:true}
        )

        //return response
        return res.status(200).json({
            success:true,
            message:"Image updated successfully",
            data: updatedUserProfile
        })
    }
    catch(err){
        console.error(err);
        return res.status(500).json({
            success:false,
            message:"Profile picture cannot be uploaded"
        })
    }
}

//instructorDashboard
exports.instructorDashboard = async(req,res)=>{
    try{
      console.log("Entered in instructorDashboard in backend");
      const courseDetails = await Course.find({instructor: req.user.id});
      const courseData = courseDetails.map((course)=>{
        const totalStudentsEnrolled = course.studentsEnrolled.length;
        const totalAmountGenerated = totalStudentsEnrolled * course.price;

        //create a new object with the additional details 
        const courseDataWithStats = {
          _id: course._id,
          courseName : course.courseName,
          courseDescription :course.courseDescription,
          totalStudentsEnrolled,
          totalAmountGenerated,
        }
        return courseDataWithStats;
      })

      return res.status(200).json({
        courses: courseData,
      })
    }
    catch(err){
      console.log(err);
      return res.status(500).json({
        success: false,
        message:"Internal Server Error"
      })
    }
}