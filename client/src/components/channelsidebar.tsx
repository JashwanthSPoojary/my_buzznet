interface ChannelsidebarProps{
    setopen:React.Dispatch<React.SetStateAction<boolean>>;
    channels: Channel[];
    selectedChannel:number | null;
    setSeletedChannel: React.Dispatch<React.SetStateAction<number | null>>

}
interface Channel {
    id: number;
    name: string;
}

const Channelsidebar = ({channels,setopen,selectedChannel,setSeletedChannel}:ChannelsidebarProps) => {      
    const handleChannelSwitch = (channel:number) =>{
        setSeletedChannel(channel)
    }
    return ( 
        <div className="h-screen bg-slate-800 w-2/12">
            <div className="flex flex-col float-start pl-5 py-7 gap-4">
                <button onClick={()=>setopen(true)}>Add channels</button>
                {channels.map((channel,index)=>(
                    <button key={index} onClick={()=>handleChannelSwitch(channel.id)}  className={`text-white cursor-pointer ${selectedChannel===channel.id?'text-red-600':'text-white'}`}>{channel.name}</button>
                ))}
            </div>
        </div>
     );
}
 
export default Channelsidebar;