const Section = require("../models/Section");
const Course = require("../models/Course");

//create section 
exports.createSection = async(req,res)=>{
    try{
        //data fetch
        const {sectionName, courseId}= req.body;
        //data validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:"Missing Properties"
            }) 
        }
        //create section
        const newSection = await Section.create({sectionName});
        console.log("section currently created", newSection);
        //update course with section objectID
        const updateCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push:{
                    courseContent: newSection._id
                }
            },
            {new:true}
        ).populate({
            path:"courseContent",
            populate:{
                path:"subSection"
            }
        })

        console.log("updateCourseDetails-: ", updateCourseDetails)
        //HW -: use populate to replace section/ sub-section both in updateCourseDetails

        //return response
        return res.status(200).json({
            success:true,
            message:"Section created successfully",
            updateCourseDetails,
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Unable to create section, please try again",
            error: err.message,
        })
    }
}

//update section 
exports.updateSection = async(req,res)=>{
    try{
        //data input
        const{sectionName, sectionId, courseId}= req.body;

        //data validation
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:"Missing Properties"
            }) 
        }

        //update data
        const section = await Section.findByIdAndUpdate(sectionId, {sectionName:sectionName},{new:true});

        const course = await Course.findById(courseId).populate({
            path:"courseContent",
            populate: {
                path:"subSection",
            },
        }).exec();

        //return res
        return res.status(200).json({
            success:true,
            message:"Section updated successfully",
           data : course
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Unable to update section, please try again",
            error: err.message,
        })
    }
}

//delete section
exports.deleteSection = async(req, res)=>{
    try{
        //get ID- assuming that we are sending id in params
        console.log("Entered in delete backend");
        // const sectionId = req.params.id;
        const {sectionId,courseId}= req.body;
        console.log("sectionId-: ",sectionId);
        console.log("courseId-: ",courseId);

        //Update Course Content
        const updateCourseContent = await Course.findByIdAndUpdate(
            {_id:courseId},
            {
                $pull:{courseContent: sectionId}
            },
            {new:true}
        ).populate({
            path:"courseContent",
            populate:{
                path:"subSection"
            }
        })
        //find and delete
        const updatedSection = await Section.findByIdAndDelete({_id:sectionId});
 
        //return res
        return res.status(200).json({
            success:true,
            message:"Section deleted successfully",
            updatedSection,
            updateCourseContent
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Unable to delete section, please try again",
            error: err.message,
        })
    }
}