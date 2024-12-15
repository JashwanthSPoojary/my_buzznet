import { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar";
import WorkspaceModal from "../../components/workspacemodal";
import { api } from "../../util/api";
import { token } from "../../util/authenticated";
import Channelsidebar from "../../components/channelsidebar";
import Channelmodal from "../../components/channelmodal";
import Channelmessages from "../../components/channelmessage";

interface Channel {
    id: number;
    name: string;
}
interface Workspace {
    id: number;
    name: string;
}
interface ActiveWorkspaceData{
    channels:[],
    id:number,
    name:string,
    owner_id:number,
    workspace_members:[]
}

const Dashboard = () => {
    const [workspaces,setWorkspaces] = useState<Workspace[]>([])
    const [channels,setChannels] = useState<Channel[]>([])
    const [open,setOpen] = useState(false);
    const [openChannelModal,setOpenChannelModal] = useState(false);
    const [selectedWorkspace,setSeletedWorkspace] = useState<number | null>(null);
    const [selectedChannel,setSeletedChannel] = useState<number | null>(null);
    const [activeWorkspaceData, setActiveWorkspaceData] = useState<ActiveWorkspaceData | null>(null);
    
    
    const addworkspacelist = (workspace:Workspace) =>{
        setWorkspaces((prev)=>[...prev,workspace])
    }
    const addchannellist = (channel:Channel) =>{
        setChannels((prev)=>[...prev,channel])
    }
    useEffect(()=>{
        const fetchWorkspaces = async () =>{
            try {
                const response = await api.get('/workspace/getworkspaces',{headers:{token:token}});
                setWorkspaces(response.data.data)      
                if(response.data.data.length>0 && !selectedWorkspace){
                    const firstworkspace = response.data.data[0].id;
                    setSeletedWorkspace(firstworkspace);
                }
            } catch (error) {
              // change this
                console.log(error);
                
            }
        }
        fetchWorkspaces();
    },[]);

    useEffect(()=>{
        if (!selectedWorkspace) return;
        const fetchWorkspaceData = async () => {
            try {
              const response = await api.get(`/workspace/${selectedWorkspace}`,{headers:{token:token}});
              setActiveWorkspaceData(response.data.data);                                          
            } catch (error) {
                //change this
              console.error("Error fetching active workspace data:", error);
            }
          };
      
          fetchWorkspaceData();
        },[selectedWorkspace]);


    useEffect(()=>{        
        if(!activeWorkspaceData) return
        const fetchChannels = async () =>{            
            try {
                const response = await api.get(`/workspace/${activeWorkspaceData?.id}/channel/getchannels`,{headers:{token:token}});
                setChannels(response.data.data)
                if(response.data.data.length>0 && !selectedChannel){
                    const firstChannel = response.data.data[0].id;
                    setSeletedChannel(firstChannel);
                }
            } catch (error) {
              // change this
                console.log(error);
                
            }
        }
        fetchChannels();
    },[activeWorkspaceData]);
    
    return ( 
        <div className="w-screen h-screen flex">
            <WorkspaceModal open={open} setopen={setOpen} onWorkspaceAdd={addworkspacelist}/>
            <Channelmodal workspaceid={activeWorkspaceData?.id} open={openChannelModal} setopen={setOpenChannelModal} onChannelAdd={addchannellist}/>
            <Sidebar setopen={setOpen} workspaces={workspaces} selectedWorkspace={selectedWorkspace} setSeletedWorkspace={setSeletedWorkspace}/>
            <Channelsidebar selectedChannel={selectedChannel} setSeletedChannel={setSeletedChannel} channels={channels} setopen={setOpenChannelModal}/>
            <Channelmessages  workspaceid={selectedWorkspace} channelid={selectedChannel}/>
        </div>
     );
}
 
export default Dashboard;