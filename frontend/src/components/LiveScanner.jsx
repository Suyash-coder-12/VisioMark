import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Camera, StopCircle, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000';

const LiveScanner = () => {
  const webcamRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Interval ref to handle continuous scanning
  const scanIntervalRef = useRef(null);

  const captureAndScan = useCallback(async () => {
    if (!webcamRef.current) return;
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setLoading(true);
    try {
      // Send directly to the fast Python Flask API instead of Node proxy
      const response = await axios.post(`http://localhost:5001/scan`, { image: imageSrc });
      setResults(response.data || []);
      setError('');
    } catch (err) {
      console.error("Scanner Error:", err);
    } finally {
      setLoading(false);
    }
  }, [webcamRef]);

  const toggleScanning = () => {
    if (isScanning) {
      // Stop
      clearInterval(scanIntervalRef.current);
      setIsScanning(false);
      setResults([]);
    } else {
      // Start
      setIsScanning(true);
      // Scan immediately, then every 800ms for fast scanning
      captureAndScan();
      scanIntervalRef.current = setInterval(() => {
        captureAndScan();
      }, 800); // 800ms creates a fast "live" feel without crashing the browser
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[800px]">
      <div className="bg-slate-50 border-b border-slate-200 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
            <Camera className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Web Live Scanner</h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">Browser-based face recognition for demonstration.</p>
          </div>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={toggleScanning}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors ${
            isScanning 
              ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isScanning ? <StopCircle className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
          {isScanning ? 'Stop Scanner' : 'Start Live Scan'}
        </motion.button>
      </div>

      <div className="flex-1 p-8 bg-slate-50 flex flex-col items-center justify-center relative">
        {/* Webcam Container */}
        <div className="relative bg-black rounded-2xl overflow-hidden shadow-lg border-4 border-slate-200" style={{ width: 640, height: 480 }}>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Overlay Box for Scanner Effect */}
          {!isScanning && (
            <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center text-white z-10 backdrop-blur-sm">
              <Camera className="w-16 h-16 mb-4 text-slate-400" />
              <p className="font-bold text-lg">Scanner is Offline</p>
              <p className="text-sm text-slate-400 mt-2">Click "Start Live Scan" to begin</p>
            </div>
          )}

          {/* Loading Indicator */}
          {isScanning && loading && (
            <div className="absolute top-4 right-4 z-20 bg-black/50 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 backdrop-blur-md">
              <RefreshCw className="w-3 h-3 animate-spin" /> Processing
            </div>
          )}

          {/* Render Bounding Boxes */}
          {isScanning && results.map((res, i) => {
            const { top, right, bottom, left } = res.box;
            const isUnknown = res.name === "Unknown";
            
            // Note: Box coordinates are based on the original image size sent to python.
            // React webcam uses CSS scaling, but assuming 640x480 match, we can draw directly.
            // face_recognition returns (top, right, bottom, left)
            const width = right - left;
            const height = bottom - top;

            return (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                key={i}
                className="absolute border-2 z-20 shadow-sm"
                style={{
                  top: top,
                  left: left,
                  width: width,
                  height: height,
                  borderColor: isUnknown ? '#ef4444' : '#10b981', // red-500 or emerald-500
                }}
              >
                <div className={`absolute -bottom-8 left-0 -ml-0.5 px-3 py-1 text-sm font-bold text-white shadow-sm whitespace-nowrap ${isUnknown ? 'bg-red-500' : 'bg-emerald-500'}`}>
                  {res.name}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Results Stream Panel */}
        <div className="w-full max-w-[640px] mt-8 bg-white border border-slate-200 rounded-xl p-4 shadow-sm h-48 overflow-y-auto custom-scrollbar">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Scan Output</h3>
          <div className="space-y-3 flex flex-col-reverse">
            {results.length === 0 && !isScanning && (
               <p className="text-sm text-slate-400 text-center py-4">Awaiting scan data...</p>
            )}
            {results.length === 0 && isScanning && !loading && (
               <p className="text-sm text-slate-400 text-center py-4 animate-pulse">Scanning environment...</p>
            )}
            {results.map((res, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                key={i} 
                className={`p-3 rounded-lg border flex items-center gap-3 ${res.name === 'Unknown' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}
              >
                {res.name === 'Unknown' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                <div>
                  <span className="font-bold text-sm block">{res.name === 'Unknown' ? 'Unknown Face Detected' : `Identity Verified: ${res.name}`}</span>
                  <span className="text-xs font-medium opacity-80">{res.name === 'Unknown' ? 'Security alert triggered & logged.' : 'Attendance marked successfully.'}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveScanner;
