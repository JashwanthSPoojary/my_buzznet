import { useEffect } from "react";
import { UseUserContext } from "../context/userContext";
import { api } from "../util/api";
import { token } from "../util/authenticated";

export const useFetchUser = () => {
  const { setUsers } = UseUserContext();
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;
      try {
        const response = await api.get("/user/userdetails", {
          headers: { token: token },
        });
        setUsers(response.data.data);
      } catch (error) {
        console.log("useFetchUser : " + error);
      }
    };
    fetchUser();
  }, [setUsers]);
};
