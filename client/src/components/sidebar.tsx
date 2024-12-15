import React from "react";
import { useNavigate } from "react-router-dom";


interface SidebarProps{
    setopen:React.Dispatch<React.SetStateAction<boolean>>
    workspaces: Workspace[];
    selectedWorkspace:number | null;
    setSeletedWorkspace: React.Dispatch<React.SetStateAction<number | null>>

}
interface Workspace {
    id: number;
    name: string;    
}

const Sidebar = ({setopen,workspaces,selectedWorkspace,setSeletedWorkspace}:SidebarProps) => {
    const navigate = useNavigate();
    const handleWorkspaceSwitch = (workspace:number) =>{
        setSeletedWorkspace(workspace)
    }
    const handlelogout = async() =>{
      localStorage.removeItem("buzznettoken");
      navigate('/signin')
    }
  return (
    <div className="h-screen bg-black w-1/12 ">
      <div className="flex flex-col gap-4 py-8 justify-between">
        <div className="flex flex-col gap-4">
          <button onClick={()=>setopen(true)}  className="text-white cursor-pointer">Add</button>
          {workspaces.map((workspace,index)=>(
              <button key={index} onClick={()=>handleWorkspaceSwitch(workspace.id)}  className={`text-white cursor-pointer ${selectedWorkspace===workspace.id?'text-red-600':'text-white'}`}>{workspace.name}</button>
          ))}
        </div>
        <button
        className="text-white"
        onClick={handlelogout}
        >Logout</button>
        </div>
        
    </div>
  );
};

export default Sidebar;
