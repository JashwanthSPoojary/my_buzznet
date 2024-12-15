import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Googleauth = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isTokenSet, setIsTokenSet] = useState(false);
    useEffect(()=>{
        const redirect = async () =>{
            const queryParams = new URLSearchParams(location.search);
            const token = queryParams.get("token");
            if(token){
                localStorage.setItem("buzznettoken",token)
                console.log("Token saved to localStorage:", localStorage.getItem("buzznettoken"));
                setIsTokenSet(true);
                navigate('/',{replace:true})
            }else{
                navigate('/signin')
            }
            }
            redirect();
    },[navigate,location])

    if(isTokenSet){
        <div className="text-2xl">is Authenticating</div>

    }

    return (
        <div className="text-2xl">is Authenticating</div>
    )
}
 
export default Googleauth;