import React, { useEffect } from 'react'
import { appendErrors, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux'
import { createRating } from '../../../services/operations/courseDetailsAPI';
import ReactStars from 'react-stars'
import IconBtn from '../../common/IconBtn';

const CourseReviewModal = ({setReviewModal}) => {
    const {user} = useSelector((state)=> state.profile);
    const {token} = useSelector((state)=> state.auth);
    const {courseEntireData}= useSelector((state)=> state.viewCourse);
    const {
        register,
        handleSubmit,
        setValue,
        fromState: {error},
    } = useForm();

    useEffect(()=>{
        setValue("courseExperience", "");
        setValue("courseRating",0);
    },[])

    const ratingChanged= (newRating)=>{
        setValue("courseRating",newRating);
    }
    const onSubmit = async(data)=>{
        await createRating({
            courseId:courseEntireData._id,
            rating: data.courseRating,
            review: data.courseExperience
        }, token);
        setReviewModal(false);

    }
  return (
    <div>
        <div>
            {/* modal header */}
            <div>
                <p>Add Review</p>
                <button 
                onClick={()=> setReviewModal(false)}>
                    Close
                </button>
            </div>

            {/* modal body */}
            <div>
                <div>
                    <img src={user?.image} alt='User Image'></img>
                    <div>
                        <p>{user?.firstName} {user?.lastName}</p>
                        <p>Posting Publicly</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}
                className='mt-6 flex flex-col items-center'>

                   <ReactStars
                    count={5}
                    onChange ={ratingChanged}
                    size={24}
                    activeColor={"#ffd700"}
                   />

                   <div>
                    <label htmlFor='courseExperience'>
                        Add Your Experience*
                    </label>
                    <textarea
                    id='courseExperience'
                    placeholder='Add Your Experience here'
                    {...register("courseExperience",{required: true})}
                    className='form-style min-h-[130px] w-full'></textarea>
                    {
                        appendErrors.courseExperience && (
                            <span>
                                Please Add Your Experience
                            </span>
                        )
                    }

                   </div>

                   {/* Cancel and Save button */}
                   <div>
                    <button
                    onClick={()=> setReviewModal(false)}>
                        Cancel
                    </button>
                    <IconBtn
                    text="Save"></IconBtn>
                   </div>

                </form>
            </div>
        </div>
    </div>
  )
}

export default CourseReviewModal