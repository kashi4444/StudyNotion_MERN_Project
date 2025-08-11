const Course= require("../models/Course")
const Cart = require("../models/Cart");

exports.addCourseToCart = async(req, res)=>{
    try{
        // fetching data
        const {courseId}= req.body;
        const userId = req.user.id;
        if(!courseId || !userId){
            return res.status(404).json({
                success:false,
                message:"All fields are required"
            })
        }
        //check cart of that user exists or not 
        let userCart = await Cart.findOne({studentId:userId});

        // let newCart;
        if(!userCart){
            userCart = await Cart.create({
                studentId: userId
            })
            // await Cart.findByIdAndUpdate(userId,
            //     {
            //         $push:{cartContent:courseId}
            //     }
            // )
        }

        //check whether the course is already present in the cart or not
        // const coursePresent= ;
        if(userCart.cartContent.includes(courseId)){
            return res.status(200).json({
                success:true,
                message:"Course is already added to the cart"
            })
        }else{
            console.log("No it has not previously added")
        }
        //now update the cart by adding course to it
        const updatedCart = await Cart.findOneAndUpdate(
            {studentId: userId},
            {
                $push:{
                    cartContent:courseId
                }
            },
            {new:true}
        ).populate("cartContent");
        return res.status(200).json({
            success:true,
            message:"Courses added to the cart successfully",
            updatedCart
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}

exports.removeCourseFromCart = async(req,res)=>{
    try{
        // fetching data
        const {courseId}= req.body;
        const userId = req.user.id;

        if(!courseId || !userId){
            return res.status(404).json({
                success:false,
                message:"All fields are required"
            })
        }
        //check cart of that user exists or not 
        const userCart = await Cart.findOne({studentId:userId});

        if(!userCart){
            return res.status(400).json({
                success: false,
                message:"Cart not found"
            })
        }

        const updatedCart = await Cart.findOneAndUpdate(
            {studentId:userId},
            {
                $pull:{
                    cartContent: courseId
                }
            },
            {new:true}
        ).populate("cartContent");

        return res.status(200).json({
            success:true,
            message:"Courses deleted from the cart successfully",
            updatedCart
        })

    }
    catch(err){
        return res.status(500).json({
            success: false,
            message:"Could not remove the course from the cart",
            error: err.message
        })
    }
}

exports.fetchCartCourses = async(req, res)=>{
    try{
        //fetch data
        const userId = req.user.id;
        
        console.log("User ID-: ",userId);

        const userCart = await Cart.findOne({studentId:userId})
        .populate("cartContent");

        if(!userCart){
            console.log("Cart of user not found")
        }
        return res.status(200).json({
            success:true,
            message:"Cart Courses fetched successfully",
            userCart
        })
    }
    catch(err){
        console.log("Could not fetch courses in cart")
        return res.status(500).json({
            success: false,
            message:  err.message

        })
    }
} 