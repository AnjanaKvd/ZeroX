import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat } from '@zxing/library';
import { 
  playSuccessBeep, 
  normalizeBarcode
} from '../../utils/barcodeUtils';

const QuaggaScanner = ({ onScan, onClose, onError }) => {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [stream, setStream] = useState(null);
  // Track last scan to prevent duplicates
  const lastScanRef = useRef(null);

  // Handle errors and pass them to the parent component
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  // Handle proper cleanup and initialization
  useEffect(() => {
    let mounted = true;
    
    // Initialize camera and request permissions
    const setupCamera = async () => {
      try {
        // Request camera access with optimized settings
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 30 }
          },
          audio: false
        });
        
        if (!mounted) {
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }
        
        // Save stream and update permission state
        setStream(mediaStream);
        setHasPermission(true);
        
        // Assign stream to video element directly
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(err => {
            console.error("Error playing video:", err);
            setError("Could not start video stream. Please try again.");
          });
          
          // Use requestAnimationFrame for smoother initialization
          requestAnimationFrame(() => {
            if (videoRef.current && videoRef.current.readyState >= 2) {
              initializeScanner();
            } else {
              videoRef.current.onloadeddata = () => {
                initializeScanner();
              };
            }
          });
        }
      } catch (err) {
        console.error('Camera access error:', err);
        if (mounted) {
          setHasPermission(false);
          setError(`Camera access denied: ${err.message}. Please check your browser settings and try again.`);
        }
      }
    };
    
    setupCamera();

    return () => {
      mounted = false;
      // Make sure we always clean up properly
      stopMediaTracks();
    };
  }, []);

  // Initialize ZXing scanner
  const initializeScanner = async () => {
    try {
      // Don't proceed if we don't have camera permission or video element
      if (!hasPermission || !videoRef.current) {
        return;
      }
      
      // Create a new reader instance if it doesn't exist
      if (!readerRef.current) {
        const hints = new Map();
        hints.set(2, true); // Enable try harder mode
        
        const reader = new BrowserMultiFormatReader(hints, 500); // Reduce scan interval to 500ms
        
        // Focus on the most common barcode formats
        reader.setFormats([
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
          BarcodeFormat.CODE_128
        ]);
        
        readerRef.current = reader;
      }
      
      // Start decoding from the video element
      if (videoRef.current && readerRef.current) {
        setScanning(true);
        console.log("Starting barcode scanning...");
        
        try {
          await readerRef.current.decodeFromVideoElement(videoRef.current, (result, err) => {
            if (result) {
              const scannedCode = result.getText();
              
              // Don't process the same code scanned within 2 seconds
              if (lastScanRef.current && lastScanRef.current.code === scannedCode && 
                  (Date.now() - lastScanRef.current.timestamp < 2000)) {
                return;
              }
              
              console.log('Barcode scanned:', scannedCode);
              
              // Save scan with timestamp
              lastScanRef.current = {
                code: scannedCode,
                timestamp: Date.now()
              };
              
              // Immediate feedback
              navigator.vibrate && navigator.vibrate(100);
              playSuccessBeep();
              
              // Immediately accept the code - no multiple scan validation
              stopMediaTracks();
              onScan(normalizeBarcode(scannedCode));
              onClose();
            }
            
            if (err && err.name !== 'NotFoundException') {
              console.error('Scanner error:', err);
              setError('Failed to read barcode. Please try again with better lighting and hold the camera steady.');
            }
          });
          console.log("Scanner started successfully");
        } catch (decodeErr) {
          console.error('Failed to start decoding:', decodeErr);
          setError(`Scanner initialization failed: ${decodeErr.message}`);
        }
      } else {
        setError("Video element not available or not ready");
      }
    } catch (err) {
      console.error('ZXing initialization failed:', err);
      setError('Failed to initialize scanner. Please try again or use a different device.');
    }
  };

  // Explicit scanner stop function
  const stopScanner = () => {
    try {
      if (readerRef.current) {
        readerRef.current.reset();
        readerRef.current = null;
        console.log('ZXing scanner stopped');
      }
    } catch (error) {
      console.error('Error stopping scanner:', error);
    }
    
    setScanning(false);
  };
  
  // Function to properly stop all media tracks
  const stopMediaTracks = () => {
    try {
      // Stop the reader first
      stopScanner();
      
      // Stop all tracks in our saved stream
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
    } catch (error) {
      console.error('Error stopping media tracks:', error);
    }
  };

  // Call this when closing the scanner manually
  const handleClose = () => {
    stopMediaTracks();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Scan Barcode (Fallback Scanner)</h3>
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
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* Scan guide line for better UX */}
                <div className="w-full h-2 bg-red-500 opacity-50"></div>
              </div>
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
          <div className="bg-green-50 p-2 text-sm border border-green-200 rounded mb-4 flex items-center">
            <div className="animate-pulse mr-2 h-2 w-2 rounded-full bg-green-500"></div>
            <span>Scanner active - center the barcode in frame</span>
          </div>
        )}
        
        <div className="text-sm text-gray-500 mb-4">
          For fastest scanning:
          <ul className="list-disc ml-5 mt-1">
            <li>Hold camera 4-8 inches from barcode</li>
            <li>Ensure adequate lighting</li>
            <li>Keep camera steady</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QuaggaScanner; 