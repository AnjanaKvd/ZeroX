// components/common/LoadingOverlay.jsx
import React from 'react';
import { Spinner } from './LoadingSpinner/Spinner';

const LoadingOverlay = ({ message = 'Loading...', isFullScreen = false }) => {
  // If not fullscreen, render an inline loader instead of a modal overlay
  if (!isFullScreen) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner className="w-8 h-8 text-blue-600" />
        <span className="ml-3 text-gray-600">{message}</span>
      </div>
    );
  }
  
  // Full screen overlay with z-index and proper positioning
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
        <Spinner className="h-12 w-12 text-blue-600 mx-auto" />
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;