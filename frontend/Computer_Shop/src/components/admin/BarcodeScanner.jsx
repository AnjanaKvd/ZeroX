import React, { useState, useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat } from '@zxing/library';

const BarcodeScanner = ({ onScan, onClose }) => {
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const readerRef = useRef(null);

  // Request camera permissions when component mounts
  useEffect(() => {
    let mounted = true;
    
    // Initialize camera and request permissions
    const setupCamera = async () => {
      try {
        console.log("BarcodeScanner: Requesting camera access...");
        // Request camera access first
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false
        });
        
        if (!mounted) {
          // If component unmounted during permission request, clean up
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }
        
        console.log("BarcodeScanner: Camera access granted");
        // Save stream and update permission state
        setStream(mediaStream);
        setHasPermission(true);
        
        // Assign stream to video element directly
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          
          // Play video and catch any errors
          videoRef.current.play().catch(err => {
            console.error("Error playing video:", err);
            setError("Could not start video stream. Please try again.");
          });
          
          // Wait for video to be ready before starting scanner
          videoRef.current.onloadedmetadata = () => {
            console.log("BarcodeScanner: Video metadata loaded, initializing scanner...");
            initializeReader();
          };
        } else {
          console.error("Video reference not available");
          setError("Camera initialization failed: video element not available");
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        if (mounted) {
          setHasPermission(false);
          setError(`Camera access denied: ${err.message}. Please check your browser settings and try again.`);
        }
      }
    };

    setupCamera();

    return () => {
      // Clean up on unmount
      mounted = false;
      stopMediaTracks();
    };
  }, []);

  // Initialize ZXing barcode reader
  const initializeReader = async () => {
    try {
      // Don't proceed if we don't have camera permission or video element
      if (!hasPermission || !videoRef.current) {
        console.error("Cannot initialize reader: no permission or no video element");
        return;
      }
      
      // Create a new reader instance if it doesn't exist
      if (!readerRef.current) {
        console.log("Creating new ZXing reader instance");
        const hints = new Map();
        hints.set(2, true); // Enable try harder mode
        
        const reader = new BrowserMultiFormatReader(hints);
        reader.setFormats([
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
          BarcodeFormat.CODE_39,
          BarcodeFormat.CODE_128,
          BarcodeFormat.QR_CODE
        ]);
        
        readerRef.current = reader;
      }
      
      // Start decoding from the video element
      if (videoRef.current && readerRef.current) {
        console.log("BarcodeScanner: Starting barcode scanning...");
        setScanning(true);
        
        try {
          // Use the video element directly
          await readerRef.current.decodeFromVideoElement(videoRef.current, (result, error) => {
            if (result) {
              const scannedCode = result.getText();
              console.log('Barcode scanned:', scannedCode);
              stopMediaTracks();
              onScan(scannedCode);
              onClose(); // Close the scanner after successful scan
            }
            
            if (error && error.name !== 'NotFoundException') {
              console.error('Scanner error:', error);
              setError('Failed to read barcode. Please try again with better lighting and hold the camera steady.');
            }
          });
          console.log("BarcodeScanner: Scanner started successfully");
        } catch (decodeErr) {
          console.error('Failed to start decoding:', decodeErr);
          setError(`Scanner initialization failed: ${decodeErr.message}`);
        }
      } else {
        setError("Video element not available or not ready");
      }
    } catch (error) {
      console.error('Error initializing barcode reader:', error);
      setError('Failed to initialize barcode scanner. Please try again.');
    }
  };

  // Function to properly stop all media tracks
  const stopMediaTracks = () => {
    try {
      // Stop the ZXing reader
      if (readerRef.current) {
        readerRef.current.reset();
        readerRef.current = null;
        console.log('ZXing reader reset');
      }
      
      // Stop the saved stream
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
          console.log('Media track stopped:', track.kind);
        });
        setStream(null);
      }
      
      // Additionally, check video element
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => {
          track.stop();
          console.log('Media track stopped from video element:', track.kind);
        });
        videoRef.current.srcObject = null;
      }
      
      // Safety check for any other video elements
      const videoElements = document.querySelectorAll('video');
      videoElements.forEach(video => {
        if (video.srcObject && video !== videoRef.current) {
          const tracks = video.srcObject.getTracks();
          tracks.forEach(track => {
            track.stop();
            console.log('Media track stopped from other video element:', track.kind);
          });
          video.srcObject = null;
        }
      });
      
      setScanning(false);
    } catch (error) {
      console.error('Error stopping media tracks:', error);
    }
  };

  const handleClose = () => {
    stopMediaTracks();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Scan Barcode</h3>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="relative w-full aspect-square mb-4">
          {hasPermission === false ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-center p-4">
              <p>Camera access denied. Please check your browser settings and grant camera permission.</p>
            </div>
          ) : (
            <>
              <video 
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                playsInline
                muted
                autoPlay
              />
              <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none">
                <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-blue-500"></div>
                <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-blue-500"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-blue-500"></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-blue-500"></div>
              </div>
            </>
          )}
        </div>
        
        {error && (
          <div className="text-red-500 text-sm mb-4">{error}</div>
        )}
        
        {!hasPermission && !error && (
          <div className="bg-yellow-50 p-2 text-sm border border-yellow-200 rounded mb-4">
            Waiting for camera permission...
          </div>
        )}
        
        {scanning && !error && (
          <div className="bg-green-50 p-2 text-sm border border-green-200 rounded mb-4">
            Scanner active - looking for barcodes...
          </div>
        )}
        
        <div className="text-sm text-gray-500 mb-4">
          <p>Position the barcode within the scanner frame.</p>
          <p className="mt-1">For best results:</p>
          <ul className="list-disc pl-5 mt-1">
            <li>Ensure good lighting</li>
            <li>Hold the camera steady</li>
            <li>Position camera 6-8 inches from barcode</li>
          </ul>
        </div>

        <button
          onClick={handleClose}
          className="w-full py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BarcodeScanner; 