src/
├── api/                // For API interaction (e.g., Axios instances, service files)
├── components/         // Reusable components
│   ├── auth/           // Components related to login/signup
│   ├── workspace/      // Components related to workspaces
│   ├── channel/        // Components related to channels
│   └── shared/         // Generic reusable components like buttons, modals, etc.
├── context/            // Context for auth, workspace state
├── hooks/              // Custom React hooks
├── pages/              // React Router pages
│   ├── Auth/           // Login, Signup pages
│   ├── Dashboard/      // Main dashboard page
│   └── Workspace/      // Workspace and channels (nested routes)
├── styles/             // Tailwind or CSS styles
├── utils/              // Utility functions
└── App.tsx             // Main app entry
