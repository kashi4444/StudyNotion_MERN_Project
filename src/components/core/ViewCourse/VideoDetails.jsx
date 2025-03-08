import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { markLectureAsComplete } from '../../../services/operations/courseDetailsAPI';
import { updateCompletedLectures } from '../../../slices/viewCourseSlice';
import { Player } from 'video-react';
import 'video-react/dist/video-react.css';
import {AiFillPlayCircle} from "react-icons/ai"
import { useRef } from 'react';
import IconBtn from '../../common/IconBtn';

const VideoDetails = () => {
  
  const {courseId, sectionId, subSectionId}= useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const playerRef = useRef();
  const {token} = useSelector((state)=> state.auth);
  const {courseSectionData, courseEntireData,completedLectures} = useSelector((state)=> state.viewCourse);

  const [videoData, setVideoData]= useState([]);
  const [videoEnded, setVideoEnded]= useState(false);
  const [loading, setLoading]= useState(false);

  useEffect(()=>{
    const setVideoSpecificDetails = async()=>{
      if(!courseSectionData.length)
        return;

      if(!courseId || !sectionId || !subSectionId){
        navigate("/dashboard/enrolled-courses");
      }
      else{
        const filteredData = courseSectionData.filter((course)=> course._id === sectionId)
  
        const filteredVideoData = filteredData?.[0].subSection.filter((data)=> data._id === subSectionId)
  
        setVideoData(filteredVideoData[0]);
        setVideoEnded(false);
      }
    }
    setVideoSpecificDetails();
  },[courseSectionData, courseEntireData, location.pathname])

  const isFirstVideo = ()=>{
    const currentSectionIndex = courseSectionData.findIndex((data)=> data._id === sectionId)
    
    const currentSubSection = courseSectionData[currentSectionIndex].subSection.findIndex((data)=> data._id === subSectionId)

    if(currentSectionIndex === 0 && currentSubSection === 0){
      return true;
    }
    else{
      return false;
    }
  }
  const isLastVideo = ()=>{
    const currentSectionIndex = courseSectionData.findIndex((data)=> data._id === sectionId)
    
    const currentSubSection = courseSectionData[currentSectionIndex].subSection.findIndex((data)=> data._id === subSectionId);

    const noOfSubSections = courseSectionData[currentSectionIndex].subSectionId.length;

    if(currentSectionIndex === courseSectionData.length -1 && currentSubSection === noOfSubSections - 1){
      return true;
    }
    else{
      return false;
    }

  }
  const goToNextVideo = ()=>{
    const currentSectionIndex = courseSectionData.findIndex((data)=> data._id === sectionId)
    
    const currentSubSection = courseSectionData[currentSectionIndex].subSection.findIndex((data)=> data._id === subSectionId);

    const noOfSubSections = courseSectionData[currentSectionIndex].subSectionId.length;

    
    if(currentSubSection !== noOfSubSections-1){
      //if we want to go to the next video of the same section
      const nextSubSectionId = courseSectionData[currentSectionIndex].subSection[currentSectionIndex + 1]._id;

      //iss video pe jao
      navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${nextSubSectionId}`)
    }
    else{
      //if we want to go to the first video of the next section
      const nextSectionId = courseSectionData[currentSectionIndex + 1]._id;
      const nextSubSectionId = courseSectionData[currentSectionIndex + 1].subSectionId[0]._id;

      //iss video pe jao
      navigate(`/view-course/${courseId}/section/${nextSectionId}/sub-section/${nextSubSectionId}`)
    }

  }
  const goToPrevVideo = ()=>{
    const currentSectionIndex = courseSectionData.findIndex((data)=> data._id === sectionId)
    
    const currentSubSection = courseSectionData[currentSectionIndex].subSection.findIndex((data)=> data._id === subSectionId);

    const noOfSubSections = courseSectionData[currentSectionIndex].subSectionId.length;

    if(currentSubSection !== 0){
      //if we want to go to the prev video of the same section
      const prevSubSectionId = courseSectionData[currentSectionIndex].subSection[currentSectionIndex - 1]._id;

      //iss video pe jao
      navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${prevSubSectionId}`)

    }
    else{
      //if we want to go to the last video of the prev section
      const prevSectionId = courseSectionData[currentSectionIndex - 1]._id;
      const prevSubSectionLength = courseSectionData[currentSectionIndex - 1].subSection.length;
      const prevSubSectionId = courseSectionData[currentSectionIndex - 1].subSectionId[prevSubSectionLength - 1]._id;

      //iss video pe jao
      navigate(`/view-course/${courseId}/section/${prevSectionId}/sub-section/${prevSubSectionId}`)
    }

  }
  const handleLectureCompletion= async()=>{

    //dummy code, baad me we will replace it with the actual code
    setLoading(true);
    //PENDING -: Course Progress Pending
    const res = await markLectureAsComplete({courseId: courseId, subSectionId: subSectionId}, token);

    //state update
    if(res){
      dispatch(updateCompletedLectures(subSectionId));
    }

    setLoading(false);

  }
  return (
    <div>
      {
        !videoData ? (<div>No Data Found</div>):(
          <Player
          ref={playerRef}
          aspectRatio='16:9'
          playsInline
          onEnded={() => setVideoEnded(true)}
          src={videoData?.videoUrl}
          >
            <AiFillPlayCircle/>

            {
              videoEnded && (
                <div>
                  !completedLectures.includes(subSectionId) && (
                    <IconBtn
                      disabled={loading}
                      onClick={()=> handleLectureCompletion()}
                      text={!loading ? "Mark As Completed" : "Loading..."}
                    />
                  )

                  <IconBtn
                      disabled={loading}
                      onClick={()=> {
                        if(playerRef?.current){
                          playerRef.current?.seek(0);
                          setVideoEnded(false)
                        }
                      }}
                      text="Rewatch"
                      customClasses="text-xl"
                    />

                    <div>
                      {!isFirstVideo() && (
                        <button
                        disabled={loading}
                        onClick={goToPrevVideo}
                        className='blackButton'
                        >
                          Prev
                        </button>
                      )}

                      {
                        !isLastVideo() && (
                          <button
                          disabled={loading}
                          onClick={goToNextVideo}
                          className='blackButton'>
                            Next
                          </button>
                        )
                      }
                    </div>
                </div>
              )
            }
          </Player>
        )
      }
      <h1>
        {videoData?.title}
      </h1>
      <p>
        {videoData?.description}
      </p>
    </div>
  )
}

export default VideoDetails