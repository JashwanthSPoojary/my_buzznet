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
import { VoiceChannelProvider } from './context/voiceChannelContext.tsx';
import { VoiceConnectionProvider } from './context/voiceConnection.tsx';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <WorkspaceProvider>
      <ChannelProvider>
        <MessageProvider>
          <UserProvider>
            <MemberProvider>
              <DMProvider>
                <VoiceChannelProvider>
                  <VoiceConnectionProvider>
                  <App />
                  </VoiceConnectionProvider>
                </VoiceChannelProvider>
              </DMProvider>
            </MemberProvider>
          </UserProvider>
        </MessageProvider>
      </ChannelProvider>
    </WorkspaceProvider>
  </BrowserRouter>
)
