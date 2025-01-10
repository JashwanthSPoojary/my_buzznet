import { createContext, ReactNode, useContext, useState } from "react";

interface Owner {
    id: number;
    created_at: Date;
    username: string;
    email: string | null;
    password_hash: string;
}
interface Workspace {
    name: string;
    id: number;
    owner_id: number;
    owner:Owner
} 
interface WorkspaceContextType {
    workspaces:Workspace[];
    setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[]>>;
    selectedWorkspace:number | undefined;
    setSeletedWorkspace: React.Dispatch<React.SetStateAction<number | undefined>>;
}
interface WorkspaceProviderType {
    children: ReactNode
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined >(undefined);


export const WorkspaceProvider = ({children}:WorkspaceProviderType) => {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [selectedWorkspace, setSeletedWorkspace] = useState<number>();
    return (
        <WorkspaceContext.Provider value={{workspaces,setWorkspaces,selectedWorkspace,setSeletedWorkspace}}>
            {children}
        </WorkspaceContext.Provider>
    )
}

export const UseWorkspaceContext = () => {
    const context = useContext(WorkspaceContext);
    if(!context) throw new Error("useWorkspaceContext must be used within a WorkspaceProvider");
    return context;
}
