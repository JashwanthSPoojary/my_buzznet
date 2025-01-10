import { createContext, ReactNode, useContext, useState } from "react";

interface User{
    id: number;
    created_at: Date;
    username: string;
    email: string | null;
    password_hash: string;
}
interface UserContextType {
    users:User | undefined;
    setUsers: React.Dispatch<React.SetStateAction<User | undefined>>;

}
interface UserProviderType {
    children: ReactNode
}

const UserContext = createContext<UserContextType | undefined >(undefined);

export const UserProvider = ({children}:UserProviderType) => {
    const [users, setUsers] = useState<User>();
    return (
        <UserContext.Provider value={{users,setUsers}}>
            {children}
        </UserContext.Provider>
    )
}

export const UseUserContext = () => {
    const context = useContext(UserContext);
    if(!context) throw new Error("useUserContext must be used within a userProvider");
    return context;
}
