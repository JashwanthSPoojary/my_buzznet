import { createContext, ReactNode, useContext, useState } from "react";

interface Member {
    id: number;
    username: string;
    email: string | null;
} 
interface MemberContextType {
    members:Member[];
    setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
    selectedMember:number | undefined;
    setSeletedMember: React.Dispatch<React.SetStateAction<number | undefined>>;
}
interface MemberProviderType {
    children: ReactNode
}

const MemberContext = createContext<MemberContextType | undefined >(undefined);
export const MemberProvider = ({children}:MemberProviderType) => {
    const [members, setMembers] = useState<Member[]>([]);
    const [selectedMember, setSeletedMember] = useState<number>();
    return (
        <MemberContext.Provider value={{members,setMembers,selectedMember,setSeletedMember}}>
            {children}
        </MemberContext.Provider>
    )
}
export const UseMemberContext = () => {
    const context = useContext(MemberContext);
    if(!context) throw new Error("useMemberContext must be used within a memberProvider");
    return context;
}

