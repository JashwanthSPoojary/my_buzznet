import React from "react";
import { authenticated } from "../util/authenticated";
import { Navigate } from "react-router-dom";

interface ProtectedrouteProps {
    children: React.ReactElement;
}

const Protectedroute = ({children}:ProtectedrouteProps) => {
    if(authenticated()){
        return children

    }
    return <Navigate to='/signin'/>
}
 
export default Protectedroute;