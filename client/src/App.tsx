import { Routes,Route } from "react-router-dom";
import SignIn from "./pages/auth/sign_in";
import SignUp from "./pages/auth/sign_up";

const App = () => {
  return ( 
    <>
      <Routes>
        <Route path="/signup" element={<SignUp/>} />
        <Route path="/signin" element={<SignIn/>} />
      </Routes>
    </>
   );
}
 
export default App;