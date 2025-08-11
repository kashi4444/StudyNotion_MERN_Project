import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import IconBtn from '../../common/IconBtn';

const VideoDetailSidebar = ({setReviewModal}) => {
    const [activeStatus, setActiveStatus]= useState("");
    const [videoBarActive , setVideoBarActive]= useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const {sectionId, subSectionId}= useParams();
    const {
        courseSectionData,
        courseEntireData,
        totalNoOfLectures,
        completedLectures
    } = useSelector((state)=> state.auth);

    useEffect(()=>{
        const setActiveFlags =(()=>{
            if(!courseSectionData.length)
                return;

            //now finding index of the current section, current subSection which will later be used for highlighting the div in the sidebar
            const currentSectionIndex = courseSectionData.findIndex((data)=> data._id === sectionId)

            const currentSubSection = courseSectionData?.[currentSectionIndex]?.subSection.findIndex(
                (data) => data._id === subSectionId
            )

            const activeSubSectionId = courseSectionData?.[currentSectionIndex]?.subSection?.[currentSubSection]?._id;

            //set current section here
            setActiveStatus(courseSectionData?.[currentSectionIndex]?._id);
            //set current sub section here
            setVideoBarActive(activeSubSectionId);
        })
        setActiveFlags();
    },[courseSectionData, courseEntireData, location.pathname]);

    const handleAddReview = ()=>{
        setReviewModal(true);
    }

  return (
    <>
        <div className='text-white'>
            {/* for buttons and headings */}
            <div>
                {/* for buttons */}
                <div>
                    <div
                    onClick={()=>{
                        navigate("/dashboard/enrolled-courses")
                    }}>
                        Back
                    </div>
    
                    <div>
                        <IconBtn
                            text="Add Review"
                            onclick={()=> handleAddReview()}
                        />
                    </div>
                </div>
                {/* for heading or title */}
                <div>
                   <p>{courseEntireData?.courseName}</p>
                   <p>{completedLectures?.length} / {totalNoOfLectures}</p>
    
                </div>
            </div>

            {/* for section and subsection */}
            <div>
                {
                    courseSectionData.map((section, index)=>(
                        <div onClick={()=>setActiveStatus(section._id)}
                        key={index}>
    
                            {/* section */}
                            
                            <div>
                              <div>
                                {section?.sectionName}
                              </div>
                              {/* HW- add arrow icon here and write its rotation logic here */}
                            </div>

                            {/* subSection */}
                            <div>
                                {
                                    activeStatus === section._id && (
                                        <div>
                                            {
                                                section.subSection.map((topic, index)=>(
                                                    <div 
                                                    className={`flex gap-5 p-5 
                                                    ${videoBarActive === topic._id ? "bg-yellow-200 text-richblack-900" 
                                                                                     :"bg-richblack-900 text-white"}`} 
                                                                                     key={index}
                                                                                     onClick={()=>{
                                                                                        navigate(`/view-course/${courseEntireData?._id}/section/${section?._id}/sub-section/${topic?._id}`)
                                                                                        setVideoBarActive(topic._id)

                                                                                     }}>
                                                        <input 
                                                        type='checkbox' 
                                                        checked={completedLectures.includes(topic?._id)} 
                                                        onChange={()=>{}}></input>
                                                        <span>{topic.title}</span>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    </>
  )
}

export default VideoDetailSidebar