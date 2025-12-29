
import React, { useRef, useState, useEffect } from 'react';

interface ScannerProps {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasPermission(true);
      } catch (err) {
        console.error("Camera error:", err);
        setHasPermission(false);
      }
    }
    setupCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
        const base64 = dataUrl.split(',')[1];
        onCapture(base64);
      }
    }
  };

  if (hasPermission === false) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-6 text-white">
        <i className="fas fa-exclamation-triangle text-4xl mb-4 text-yellow-500"></i>
        <h2 className="text-xl font-bold mb-2">Camera Access Denied</h2>
        <p className="text-center mb-6 text-gray-400">Please enable camera permissions in your browser settings to use the scanner.</p>
        <button onClick={onClose} className="bg-white text-black px-6 py-2 rounded-full font-semibold">Go Back</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden">
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
        <button onClick={onClose} className="text-white bg-black/50 w-10 h-10 rounded-full flex items-center justify-center">
          <i className="fas fa-times"></i>
        </button>
        <span className="text-white font-medium text-sm bg-black/50 px-3 py-1 rounded-full">Scan Product</span>
        <div className="w-10"></div>
      </div>

      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="flex-1 object-cover"
      />
      
      <canvas ref={canvasRef} className="hidden" />

      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-64 h-64 border-2 border-white/50 rounded-2xl relative">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1 rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1 rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1 rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1 rounded-br-lg"></div>
          
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-500/30 animate-pulse"></div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-10 flex flex-col items-center safe-area-inset-bottom">
        <button 
          onClick={captureImage}
          className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
        >
          <div className="w-16 h-16 rounded-full border-4 border-gray-100 flex items-center justify-center">
             <i className="fas fa-camera text-2xl text-blue-600"></i>
          </div>
        </button>
        <p className="text-white mt-4 text-sm font-medium">Position product inside the frame</p>
      </div>
    </div>
  );
};

export default Scanner;
