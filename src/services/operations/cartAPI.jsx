import {toast} from "react-hot-toast"

import { apiConnector } from "../apiconnector"
import { cartEndpoints } from "../apis"

const{
    ADD_COURSE_TO_CART_API,
    REMOVE_COURSE_FROM_CART_API,
    FETCH_CART_COURSES_API
} = cartEndpoints;

//add course to cart
export const addCartCourses = async(courseId,token)=>{
    let result =[];
    const toastId = toast.loading("Loading...")
    try{
        const response = await apiConnector("POST", ADD_COURSE_TO_CART_API,{courseId},{
             Authorization: `Bearer ${token}`
        })
        if(!response?.data?.success){
            throw new Error("Could not add course")
        }
        // toast.success("Course added to the cart successfully");
        toast.success(response.data.message)
        result = response?.data?.updatedCart;
    }
    catch(err){
        console.log("ADD COURSE TO CART API ERROR.....",err)
        toast.error(err.message);
    }
    toast.dismiss(toastId);
    return result;
}

//remove course from cart
export const removeCartCourse = async(courseId,token)=>{
    let result =[];
    const toastId = toast.loading("Loading...")
    try{
        const response = await apiConnector("DELETE", REMOVE_COURSE_FROM_CART_API, 
        {courseId},
        {
        Authorization:`Bearer ${token}`
        })
        console.log("REMOVING COURSE FROM CART.......",response)
        if(!response?.data?.success){
            throw new Error("Could not remove course from course");
        }
        toast.success("Course Removed from the cart successfully")
        result = response?.data?.updatedCart
    }
    catch(err){
        toast.error(err.message);
    }
    toast.dismiss(toastId);
    return result;
}

//fetch cart courses
export const fetchCartCourses = async(token)=>{
    let result =[];
    const toastId = toast.loading("Loading...");
    try{
        const response = await apiConnector("GET",FETCH_CART_COURSES_API,null, {
            Authorization:`Bearer ${token}`
        })
        if(!response?.data?.success){
            throw new Error("Could not fetch courses of the cart")
        }
        toast.success("Cart courses fetched successfully")
        result= response?.data?.userCart?.cartContent;
    }
    catch(err){
        toast.error(err);
    }
    toast.dismiss(toastId);
    return result;
}

