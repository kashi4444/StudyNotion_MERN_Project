import React from 'react'
import Instructor from "../../../assets/Images/Instructor.png"
import HighlightText from './HighlightText'
import CTAButton from './CTAButton'
import { FaArrowRight } from 'react-icons/fa'
const InstructorSection = () => {
  return (
    <div className='mt-16'>
      <div className='flex flex-row gap-20 items-center'>

        {/* left section */}
        <div className='w-[50%]'>
          <img src={Instructor} alt='' className='shadow-white'></img>
        </div>

        {/* right section */}
        <div className='w-[50%] flex flex-col gap-10'>
          <div className='text-4xl font-semibold w-[50%]'>
            Become an 
            <HighlightText text={"instructor"}></HighlightText>
          </div>
          
          <p className='text-[16px] text-richblack-300 font-medium w-[80%]'>Instructors from around the world teach millions of students on StudyNotion. We provide the tools and skills to teach what you love.</p>
          <div className='w-fit'>
            <CTAButton active={true} linkto={"/signup"}>
              <div className='flex flex-row items-center gap-2'>
                Start Teaching Today 
                <FaArrowRight></FaArrowRight>
              </div>
            </CTAButton>
          </div>
          
        </div>
      </div>
    </div>
  )
}

export default InstructorSection