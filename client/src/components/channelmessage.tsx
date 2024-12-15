import { useEffect, useState } from "react";
import { api } from "../util/api";
import { token } from "../util/authenticated";

interface ChannelmessagesProps {
    workspaceid:number | null;
    channelid:number | null
}


const Channelmessages = ({workspaceid,channelid}:ChannelmessagesProps) => {    
    const [message,setMessage] = useState<string>("");
    const [allmessage,setAllMessage] = useState([]);
    const [fetch,setFetch] = useState<boolean>(true);

    const handleSubmit = async (e:React.FormEvent) =>{
        e.preventDefault();
        try {
            const response = await api.post(`/workspace/${workspaceid}/channel/${channelid}/message/create`, 
                {
                    content:message
                },
                {headers:{token:token}}
            );
            console.log(response.data.data);
            setMessage("")
            setFetch(!fetch);
        } catch (err) {
            console.log(err);
        }
    }
    useEffect(()=>{
        const fetchAllMessages = async () => {
            try {
                const response = await api.get(`/workspace/${workspaceid}/channel/${channelid}/getmessages`, 
                    {headers:{token:token}}
                );
                setAllMessage(response.data.data)
            } catch (err) {
                console.log(err);
            }
        }
        fetchAllMessages();
    },[workspaceid,channelid,fetch])
    
    
    return ( 
        <div className="h-screen bg-slate-600 w-9/12">
            <div className="h-full flex flex-col justify-between px-3 py-4">
                <div>
                    {allmessage.map((value,index)=>(
                        <div key={index}>{value.content}</div>
                    ))}
                </div>
                <form  onSubmit={handleSubmit}className="flex gap-2">

                    <input value={message} onChange={(e)=>setMessage(e.target.value)} className="w-11/12 py-3 px-2" type="text" placeholder="enter the message" />
                    <button
                     className="bg-black text-lg font-semibold px-3 rounded-md text-white py-3 ">Send</button>
                </form>
            </div>
        </div>
     );
}
 
export default Channelmessages;