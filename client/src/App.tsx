import { Routes, Route } from "react-router-dom";
import SignIn from "./pages/auth/sign_in";
import SignUp from "./pages/auth/sign_up";
import Googleauth from "./components/googleauth";
import Protectedroute from "./components/protectedroute";
import Dashboard from "./pages/home/dashboard";
import InvitePage from "./pages/invite/invite-page";
import LandingPage from "./pages/Landing/landing-page";

const App = () => {  
  return (
    <>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/invite/:invitetoken" element={<InvitePage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/google/callback" element={<Googleauth />} />
        <Route path="/landingpage" element={<LandingPage />} />
        <Route
          path="/workspaces/:workspaceId/*"
          element={
            <Protectedroute>
                <Dashboard />
            </Protectedroute>
          }
        />
      </Routes>
    </>
  );
};

export default App;
