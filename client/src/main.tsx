import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { WorkspaceProvider } from "./context/workspaceContext.tsx";
import { ChannelProvider } from "./context/channelContext.tsx";
import { MessageProvider } from "./context/messageContext.tsx";
import { UserProvider } from "./context/userContext.tsx";
import { MemberProvider } from "./context/memberContext.tsx";
import { DMProvider } from "./context/dmContext.tsx";
import { WebSocketProvider } from "./context/webSocketContext.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <UserProvider>
      <WorkspaceProvider>
        <ChannelProvider>
          <WebSocketProvider>
            <MessageProvider>
              <MemberProvider>
                <DMProvider>
                    <App />
                </DMProvider>
              </MemberProvider>
            </MessageProvider>
          </WebSocketProvider>
        </ChannelProvider>
      </WorkspaceProvider>
    </UserProvider>
  </BrowserRouter>
);
