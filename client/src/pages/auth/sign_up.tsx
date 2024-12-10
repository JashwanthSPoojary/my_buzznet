import { useState } from "react";
import { api,isAxios,AxiosError,AxiosErrorResponse } from "../../api/api";
import { useNavigate } from "react-router-dom";



const SignUp = () => {
    const navigate = useNavigate();

    const [username,setUsername] = useState<string>("");
    const [email,setEmail] = useState<string>("");
    const [password,setPassword] = useState<string>("");
    const [error,setError] = useState(null);

    const onSubmit = async (e:React.FormEvent) =>{
        e.preventDefault();
        try {
            const response = await api.post("/user/signup",{
                username,
                email,
                password
            })
            console.log(response);
            if(response.status === 201){
                navigate('/signin')
            }
        } catch (error) {
            // fix: = change for production=
            const err = isAxios(error)
            const errorMessage = ()
            console.log("catch error");
            setError(err.response?.data?.error);
        }
    }
    return (
        <div className="">
            <div className="w-screen h-screen flex justify-center items-center flex-row">
            <div className="flex gap-4 flex-col justify-center items-center">
                <h1 className="font-semibold text-xl">Sign Up</h1>
                    <form method="post" onSubmit={onSubmit}>
                        <div className="flex flex-col gap-4 justify-center items-center">
                            <input onChange={(e)=>setUsername(e.target.value)} className="border border-black px-5 py-1" type="text" placeholder="username" />
                            <input onChange={(e)=>setEmail(e.target.value)} className="border border-black px-5 py-1" type="email"  placeholder="youremail@gmail.com"/>
                            <input onChange={(e)=>setPassword(e.target.value)} className="border border-black px-5 py-1" type="password" placeholder="password" />
                            <button className="border bg-black text-white rounded-lg px-6 py-2">Sign Up</button>
                        </div>
                    </form>
                <p> or </p>
                <button className="border border-black px-5 py-1">
                    Google
                </button>
            </div>
        </div>
        </div>  
    );
}
 
export default SignUp;