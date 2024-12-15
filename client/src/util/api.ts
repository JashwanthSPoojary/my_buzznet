import axios,{AxiosError} from "axios";

export interface AxiosErrorResponse {
    error?:string
}
const isAxios = axios.isAxiosError;
const api = axios.create({
    //change to env
    baseURL:"http://localhost:3000",
    headers:{
        "Content-Type":"application/json"
    }
})

export {
    api,
    isAxios,
    AxiosError
}

