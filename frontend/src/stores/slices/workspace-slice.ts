import { create } from "zustand";
import { api } from "../../util/api";
import { token } from "../../util/authenticated";

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
    owner: Owner;
}
interface WorkspaceState {
    workspaces: Workspace[];
    selectedWorkspace: number | undefined;
    setWorkspaces: (workspaces: Workspace[] | ((prev:Workspace[])=>Workspace[])) => void;
    setSelectedWorkspace: (workspaceId: number | undefined) => void;
    fetchWorkspaces: () => Promise<void>;
}
export const useWorkspaceStore = create<WorkspaceState>((set) => ({
    workspaces:[],
    selectedWorkspace:undefined,
    setWorkspaces: (workspaces) =>
        set((state) => ({
          workspaces: typeof workspaces === "function" ? workspaces(state.workspaces) : workspaces,
    })),
    setSelectedWorkspace:(workspaceId)=>set(()=>({selectedWorkspace:workspaceId})),
    fetchWorkspaces:async () =>{
        if (!token) return;
        try {
            const response = await api.get("/workspace/getworkspaces", {
                headers: { token },
              });
            const workspaces = response.data.data;
            set((state) => { 
                if (JSON.stringify(state.workspaces) === JSON.stringify(workspaces)) {
                    return {};
                  }
                return { workspaces };
             });


        } catch (error) {
            console.error("Error fetching workspaces:", error);
        }
    }
}));
