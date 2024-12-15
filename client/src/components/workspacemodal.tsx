import React, { useState } from "react";
import { api, AxiosErrorResponse, isAxios } from "../util/api";
import { token } from "../util/authenticated";

interface WorkspaceModalProps{
    open:boolean;
    setopen:React.Dispatch<React.SetStateAction<boolean>>,
    onWorkspaceAdd: (workspace: { id: number; name: string }) => void;
}

const WorkspaceModal = ({open,setopen,onWorkspaceAdd}:WorkspaceModalProps) => {
    const [name,setName] = useState<string>("");
    const [error, setError] = useState<string>("");

    const onToggle = () =>{
        setopen(!open)
    }
    const handleSubmit = async (e:React.FormEvent) =>{
        e.preventDefault();
        setError("")
        try {

            const response = await api.post("/workspace/create", 
                { name: name },
                {headers:{token:token}}
            );
            if (response.status === 201) {
                onWorkspaceAdd(response.data.data);
                onToggle();
                setName(""); // Clear input
            }
        } catch (err) {
            if (isAxios(err)) {
                const errorMessage = (err.response?.data as AxiosErrorResponse)?.error || "Failed to create workspace";
                console.log(errorMessage);
                console.log(err);
                
                setError(errorMessage);
              } else {
                setError("An unexpected error occurred");
              }
        }
    }


    return ( 
        <>
        {open && (
            <div className="fixed inset-0 flex  justify-center items-center ">
                <div className="flex flex-col gap-3 border border-black p-6 rounded-md">
                    <div className="flex justify-between">
                        <h2 className="text-lg font-semibold w-11/12 max-w-md">Create workspace</h2>
                        <span className="cursor-pointer " onClick={onToggle}>X</span>
                    </div>
                    <span className="text-lg">{error}</span>
                    <form onSubmit={handleSubmit} className="flex flex-col justify-center items-center gap-3">
                        <input onChange={(e)=>setName(e.target.value)} className="border border-black px-2" type="text" placeholder="eg school,ecommerce" />
                        <button className="bg-black text-white px-4 py-1 rounded-md">Create</button>
                    </form>
                </div>
            </div>
        )}
        </>
        
     );
}
 
export default WorkspaceModal;