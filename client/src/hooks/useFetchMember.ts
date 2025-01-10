import { useEffect } from "react";
import { UseMemberContext } from "../context/memberContext"
import { token } from "../util/authenticated";
import { api } from "../util/api";
import { UseWorkspaceContext } from "../context/workspaceContext";

export const useFetchMembers = () => {
    const { setMembers } = UseMemberContext();
    const {selectedWorkspace} = UseWorkspaceContext();
    useEffect(()=>{
        if(!token) return
        const fetchMembers = async () => {
            try {
                const response = await api.get(`/workspace/${selectedWorkspace}/members`,{headers:{token:token}});
                setMembers(response.data.data);
            } catch (error) {
                console.log("useFetchMember error : "+error);
            }
        }
        fetchMembers();
    },[selectedWorkspace,setMembers]);
}