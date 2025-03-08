const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const {uploadImageToCloudinary} = require("../utils/imageUploader");
require("dotenv").config();

//create a sub section
exports.createSubSection = async(req, res)=>{
    try{
        //fetch data - sectionId is fetched to insert the subsection in it
        const {sectionId, title, description}= req.body;
        //fetch video url
        const video = req.files.video;

        console.log("sectionId-: ",sectionId);
        console.log("title-: ",title);
        console.log("description-: ",description);
        console.log("video-: ",video);

        //validation
        if(!sectionId || !title || !description || !video){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            }) 
        }

        //upload video on cloudinary
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
        
        //create a sub section
        const subSectionDetails = await SubSection.create({
            title:title,
            description:description,
            timeDuration: uploadDetails.duration,
            videoUrl: uploadDetails.secure_url
        })

        //update the section with this sub section object id
        const updatedSection = await Section.findByIdAndUpdate(
            {_id:sectionId},
            {
                $push:{subSection:subSectionDetails._id}
            },
            {new:true}
        ).populate("subSection");

        console.log("updatedSection-: ",updatedSection);
        
        //return response
        return res.status(200).json({
            success:true,
            message:"Sub-Section created successfully",
            updatedSection,
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Internal Server Error",
            error: err.message,
        })
    }
}

//TODO[H.W] = update sub section
exports.updateSubSection = async (req, res) => {
    try {
      const { sectionId, subSectionId, title, description } = req.body
      const subSection = await SubSection.findById(subSectionId)
  
      if (!subSection) {
        return res.status(404).json({
          success: false,
          message: "SubSection not found",
        })
      }
  
      if (title !== undefined) {
        subSection.title = title
      }
  
      if (description !== undefined) {
        subSection.description = description
      }
      if (req.files && req.files.video !== undefined) {
        const video = req.files.video
        const uploadDetails = await uploadImageToCloudinary(
          video,
          process.env.FOLDER_NAME
        )
        subSection.videoUrl = uploadDetails.secure_url
        subSection.timeDuration = `${uploadDetails.duration}`
      }
  
      await subSection.save()
  
      // find updated section and return it
      const updatedSection = await Section.findById(sectionId).populate(
        "subSection"
      )
  
      console.log("updated section", updatedSection)
  
      return res.json({
        success: true,
        message: "Section updated successfully",
        data: updatedSection,
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the section",
      })
    }
  }
//TODO[H.W] = delete sub section
exports.deleteSubSection = async(req, res)=>{
    try{
        //fetch data
        const {subSectionId, sectionId} = req.body;
        //validation
        if(!subSectionId || !sectionId){
            return res.status(400).json({
                success: true,
                message:"All fields are required"
            })
        }
        const subsectionToDelete = await SubSection.findById({_id:subSectionId});
        if(!subsectionToDelete){
            return res.status(400).json({
                success:false,
                message:"SubSection not found"
            })
        }

        //update subSection container in section
        await Section.findByIdAndUpdate(
            {_id:sectionId},
            {
                $pull:{subSection: subSectionId}
            },
            {new:true}
        )

        //find and delete subsection
        const subSection = await SubSection.findByIdAndDelete({_id:subSectionId});

        const updatedSection = await Section.findById(sectionId).populate("subSection")
        //return response
        return res.status(200).json({
            success:true,
            message:"Subsection Deleted Successfully",
            data: updatedSection,
        })
    }
    catch(err){
        console.error(err);
        return res.status(500).json({
            success:false,
            message:"Subsection cannot be Deleted",
            error: err.message
        })
    }
}
