import { useEffect } from "react";
import { UseWorkspaceContext } from "../context/workspaceContext"
import { api } from "../util/api";
import { token } from "../util/authenticated";

export const useFetchWorkspaces = () => {
    const  { setWorkspaces,selectedWorkspace,setSeletedWorkspace } = UseWorkspaceContext();
    useEffect(()=>{
        if(!token) return
        const fetchWorkspaces = async () => {
            try {
                const response = await api.get('/workspace/getworkspaces',{headers:{token:token}});
                setWorkspaces(response.data.data);
                if(response.data.data.length>0 && !selectedWorkspace){
                    const firstWorkspace = parseInt(response.data.data[0].id);
                    setSeletedWorkspace(firstWorkspace);
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchWorkspaces();
    },[setWorkspaces,setSeletedWorkspace,selectedWorkspace])
}