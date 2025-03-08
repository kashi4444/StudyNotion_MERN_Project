import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { fetchInstructorCourses } from '../../../services/operations/courseDetailsAPI';
import IconBtn from '../../common/IconBtn';
import CoursesTable from "./InstructorCourses/CoursesTable"
import { VscAdd } from "react-icons/vsc"

const MyCourse = () => {
    const {token} = useSelector((state)=> state.auth);
    const navigate = useNavigate();
    const [courses, setCourses]= useState([]);

    useEffect(()=>{
        const fetchCourses = async()=>{
            const result = await fetchInstructorCourses(token);
            if(result){
                setCourses(result);
            }
        }
        fetchCourses();
    },[])
  return (
    <div className='text-white '>
        <div className='flex justify-between items-center mb-2'>
            <h1 className='text-4xl'>My Courses</h1>
            <IconBtn
                text="Add Course"
                onclick={()=> navigate("/dashboard/add-course")}>

                  <VscAdd />

            </IconBtn>
        </div>

        {courses && <CoursesTable courses ={courses} setCourses={setCourses}/>}
    </div>
  )
}

export default MyCourse