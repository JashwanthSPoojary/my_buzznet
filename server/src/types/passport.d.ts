declare global {
    namespace Express {
      // Extend the existing User interface
      interface User {
        token?: string;
      }
    }
  }
  
  export {}