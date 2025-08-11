import { useSelector ,useDispatch} from "react-redux"

import RenderCartCourses from "./RenderCartCourses"
import RenderTotalAmount from "./RenderTotalAmount"
import { useEffect } from "react"

import {fetchCartCourses} from '../../../../../src/services/operations/cartAPI'

import { setCart, setTotal, setTotalItems } from "../../../../slices/cartSlice";


export default function Cart() {
  const { total, totalItems } = useSelector((state) => state.cart);
  const {token} = useSelector((state)=> state.auth);
  const{cart} = useSelector((state)=> state.cart);
  const dispatch = useDispatch();

  const fetchingCartCourses = async()=>{
    const response = await fetchCartCourses(token);

    dispatch(setCart(response));
    dispatch(setTotalItems(response?.length))

    if(response){
      const totalAmount = response.reduce((acc, curr)=> acc+ curr.price,0);
      dispatch(setTotal(totalAmount));
    }
    
  }
  useEffect(()=>{
    fetchingCartCourses();
  },[])
  return (
    <>
      <h1 className="mb-14 text-3xl font-medium text-richblack-5">Cart</h1>
      <p className="border-b border-b-richblack-400 pb-2 font-semibold text-richblack-400">
        {totalItems} Courses in Cart
      </p>
      {totalItems > 0 ? (
        <div className="mt-8 flex flex-col-reverse items-start gap-x-10 gap-y-6 lg:flex-row">
          <RenderCartCourses/>
          <RenderTotalAmount/>
        </div>
      ) : (
        <p className="mt-14 text-center text-3xl text-richblack-100">
          Your cart is empty
        </p>
      )}
    </>
  )
}