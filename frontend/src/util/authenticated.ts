export const token = localStorage.getItem("buzznettoken");

export const authenticated = ():boolean =>{
    return !!token;
}
