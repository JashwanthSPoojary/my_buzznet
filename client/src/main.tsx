import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from "react-router-dom";
import { WorkspaceProvider } from './context/workspaceContext.tsx';
import { ChannelProvider } from './context/channelContext.tsx';
import { MessageProvider } from './context/messageContext.tsx';
import { UserProvider } from './context/userContext.tsx';
import { MemberProvider } from './context/memberContext.tsx';
import { DMProvider } from './context/dmContext.tsx';
import { WebSocketProvider } from './context/webSocketContext.tsx';
import { CallProvider } from './context/incommingCall.tsx';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <WorkspaceProvider>
      <ChannelProvider>
        <CallProvider>
        <WebSocketProvider>
        <MessageProvider>
          <UserProvider>
            <MemberProvider>
              <DMProvider>
                  <App />
              </DMProvider>
            </MemberProvider>
          </UserProvider>
        </MessageProvider>
        </WebSocketProvider>
        </CallProvider>
      </ChannelProvider>
    </WorkspaceProvider>
  </BrowserRouter>
)
