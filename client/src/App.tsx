import { Routes, Route } from "react-router-dom";
import SignIn from "./pages/auth/sign_in";
import Googleauth from "./components/googleauth";
import Protectedroute from "./components/protectedroute";
import Dashboard from "./pages/home/dashboard";
import InvitePage from "./pages/invite/invite-page";
import LandingPage from "./pages/Landing/landing-page";
import SignUp2 from "./pages/auth/sign_up2";
import EmailSignUp from "./pages/auth/email_signup";
import EmailForm from "./pages/auth/email_form";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/signup" element={<SignUp2 />} />
        <Route path="/invite/:invitetoken" element={<InvitePage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/emailSignup" element={<EmailSignUp />} />
        <Route path="/emailForm/:email" element={<EmailForm />} />
        <Route path="/google/callback" element={<Googleauth />} />
        <Route path="/" element={<LandingPage />} />
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
