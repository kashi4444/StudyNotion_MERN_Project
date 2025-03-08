import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom';
// this will only run if the user is logged in
const PrivateRoute = ({children}) => {
    const {token} = useSelector((state) => state.auth);

    if(token !== null){
        return children
    }else{
        return <Navigate to="/login"></Navigate>
    }
    
}

export default PrivateRoute