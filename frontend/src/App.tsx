import { Route, Routes } from "react-router-dom";
import LandingPage from "./pages/Landing/Landing-page";
import SignIn from "./pages/auth/Sign-in";
import SignUp from "./pages/auth/Sign-up";
import EmailSignUp from "./pages/auth/Email-sign-up";
import EmailForm from "./pages/auth/Email-form";
import Protectedroute from "./util/Protected-route";
import Dashboard from "./pages/main/Dashboard";
import Googleauth from "./pages/auth/GoogleAuth";
import ErrorBoundary from "./pages/error/Error-boundary";
import Error from "./pages/error/Error";
import Demo from "./pages/demo/Demo";
import Demo2 from "./pages/demo/Demo2";
import InvitePage from "./pages/invite/Invite-page";

const App = () => {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/emailSignup" element={<EmailSignUp />} />
        <Route path="/emailForm/:email" element={<EmailForm />} />
        <Route path="/google/callback" element={<Googleauth />} />
        <Route path="/invite/:invitetoken" element={<InvitePage />} />
        <Route
          path="/workspaces/:workspaceId/*"
          element={
            <Protectedroute>
              <Dashboard />
            </Protectedroute>
          }
        />
        <Route path="/error" element={<Error />} />
        //testing
        <Route path="/demo" element={<Demo />} />
        <Route path="/demo2" element={<Demo2 />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
