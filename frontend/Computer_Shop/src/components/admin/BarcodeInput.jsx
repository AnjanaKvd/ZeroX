import { useState, useEffect, useRef } from 'react';
import { Barcode, X, AlertCircle, Loader } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/library';

const BarcodeInput = ({ value, onChange, required = false }) => {
  const [showScanner, setShowScanner] = useState(false);
  const [error, setError] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);

  // Start the barcode scanner
  const startScanner = async () => {
    setError(null);
    setCameraReady(false);
    setShowScanner(true);
    
    // Initialize the scanner when the modal is opened
    if (!codeReaderRef.current) {
      codeReaderRef.current = new BrowserMultiFormatReader();
    }
    
    setTimeout(async () => {
      try {
        if (videoRef.current) {
          
          // Get device ID for back camera if available
          let selectedDeviceId = undefined; // Use default device
          
          try {
            const videoInputDevices = await codeReaderRef.current.listVideoInputDevices();
            
            // Try to find back camera
            const backCamera = videoInputDevices.find(device => 
              /back|rear|environment|back camera/i.test(device.label)
            );
            
            if (backCamera) {
              selectedDeviceId = backCamera.deviceId;
            } else if (videoInputDevices.length > 0) {
              // Just use the first device
              selectedDeviceId = videoInputDevices[0].deviceId;
            }
          } catch (deviceErr) {
            // Continue with default camera
          }
          
          // Start continuous scanning with the chosen camera
          await codeReaderRef.current.decodeFromVideoDevice(
            selectedDeviceId,
            videoRef.current,
            (result, err) => {
              // When camera feed is active, set ready state
              if (!cameraReady) {
                setCameraReady(true);
              }
              
              if (result) {
                // Play beep sound for feedback
                try {
                  const beep = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...');
                  beep.play().catch(e => console.error('Could not play sound', e));
                } catch (e) {
                  // Ignore audio errors
                }
                
                // Update input value
                onChange(result.getText());
                
                // Close scanner
                stopScanner();
              }
              
              // Only log errors that aren't expected during normal scanning
              if (err && err.name !== 'NotFoundException') {
              }
            }
          );
          
        }
      } catch (err) {
        setError(`Camera error: ${err.message || 'Could not access camera'}`);
        setCameraReady(false);
      }
    }, 300);
  };
  
  // Stop the scanner and clean up
  const stopScanner = () => {
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset();
      } catch (err) {
      }
    }
    setShowScanner(false);
    setCameraReady(false);
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (codeReaderRef.current) {
        try {
          codeReaderRef.current.reset();
        } catch (err) {
        }
      }
    };
  }, []);
  
  return (
    <div className="w-full">
      <div className="flex">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded-l-md px-3 py-2"
          placeholder="Enter SKU..."
          required={required}
        />
        <button
          type="button"
          className="flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-md"
          onClick={(e) => {
            e.preventDefault();
            if (!showScanner) {
              startScanner();
            } else {
              stopScanner();
            }
          }}
        >
          <Barcode size={18} />
          <span className="sr-only">Scan Barcode</span>
        </button>
      </div>
      
      {error && (
        <div className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
      
      {showScanner && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-medium">Scan Barcode</h3>
              <button
                onClick={stopScanner}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              <div className="relative w-full h-64 bg-black rounded overflow-hidden">
                {error ? (
                  <div className="absolute inset-0 flex items-center justify-center flex-col p-4">
                    <AlertCircle size={40} className="text-red-500 mb-2" />
                    <p className="text-white text-center">{error}</p>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {cameraReady && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        {/* Animated scanning line */}
                        <div className="absolute w-full h-2 bg-green-500 opacity-70 animate-[scanline_2s_ease-in-out_infinite]"></div>
                        
                        {/* Scanning target */}
                        <div className="w-56 h-56 border-2 border-white rounded-lg flex items-center justify-center">
                          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white"></div>
                          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white"></div>
                          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white"></div>
                          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white"></div>
                        </div>
                      </div>
                    )}
                    {!cameraReady && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader className="w-8 h-8 text-white animate-spin" />
                      </div>
                    )}
                  </>
                )}
              </div>
              
              <p className="mt-2 text-sm text-center">
                {error ? (
                  <span className="text-red-600">{error}</span>
                ) : !cameraReady ? (
                  <span className="text-yellow-600">Initializing camera...</span>
                ) : (
                  <span className="text-green-600">Camera ready! Position barcode in the box</span>
                )}
              </p>
            </div>
            
            <div className="flex justify-end p-4 border-t">
              <button
                type="button"
                onClick={stopScanner}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style jsx="true">{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          50% { transform: translateY(100%); }
          100% { transform: translateY(-100%); }
        }
      `}</style>
    </div>
  );
};

export default BarcodeInput;