const Category = require("../models/Category");

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}


exports.createCategory = async(req, res)=>{
    try{
        //fetch data
        const {name, description}= req.body;

        //Validation
        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }

        //Create a DB entry
        const CategoryDetails = await Category.create({
            name:name,
            description: description
        });
        res.status(200).json({
            success:true,
            message:"Category Created Successfully"
        })

    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:err.message,
        })
    }
}

//get all Category 
exports.showAllCategories  = async(req,res)=>{
    try{
        const allCategories = await Category.find({}, {name:true, description:true});
        
        res.status(200).json({
            success:true,
            message:"All Category Returned Successfully",
            allCategories
        })

    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:err.message,
        })
    }
}

//categoryPageDetails
exports.categoryPageDetails = async (req, res) => {
    try {
      const { categoryId } = req.body;

      // Get courses for the specified category
      const selectedCategory = await Category.findById(categoryId)
        .populate({
          path: "courses",
          match: { status: "Published" },
          populate: "ratingAndReviews",
        })
        .exec() 
      // Handle the case when the category is not found
      if (!selectedCategory) {
        return res
          .status(404)
          .json({ success: false, message: "Category not found" })
      }
      // Handle the case when there are no courses
      console.log("No courses found for the selected category.")
      // if (selectedCategory.courses.length === 0) {
      //   console.log("No courses found for the selected category.")
      //   return res.status(404).json({
      //     success: false,
      //     message: "No courses found for the selected category.",
      //   })
      // }

      // Get courses for other categories
      const categoriesExceptSelected = await Category.find({
        _id: { $ne: categoryId },
      })
      .populate({
        path: "courses",
        match: { status: "Published" },
      })
      .exec()

      let differentCategory = await Category.findById({
        _id: categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]._id
      })
      .populate({
        path: "courses",
        match: { status: "Published" },
      })
      .exec()
      // Get top-selling courses across all categories
      const allCategories = await Category.find()
        .populate({
          path: "courses",
          match: { status: "Published" },
          populate: {
            path: "instructor",
        },
        })
        .exec()
      const allCourses = allCategories.flatMap((category) => category.courses)
      const mostSellingCourses = allCourses
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 10);

      res.status(200).json({
        success: true,
        data: {
          selectedCategory,
          differentCategory,
          mostSellingCourses,
        },
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }