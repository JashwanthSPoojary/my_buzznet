import React, { Component, ErrorInfo } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa'; // Import an icon from React Icons

class ErrorBoundary extends Component<{ children: React.ReactNode }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-screen flex justify-center items-center bg-[#0B192C] text-white p-4">
          <div className="flex items-center justify-center flex-col max-w-lg text-center">
            <FaExclamationTriangle className="text-6xl mb-4 sm:text-5xl md:text-6xl lg:text-7xl" />
            <h1 className=" font-bold mb-2 text-xl sm:text-2xl md:text-3xl">Oops! Something went wrong.</h1>
            <p className="text-lg sm:text-base md:text-lg">Please try again later.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
