import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { Camera, CameraOff, AlertCircle, CheckCircle, Eye, EyeOff, Clock, Users, Shield, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface SimpleCameraMonitorProps {
  isEnabled: boolean;
  onCameraReady: (isReady: boolean) => void;
  onViolation?: (type: string) => void;
  onReport?: (report: any) => void;
}

export const SimpleCameraMonitor: React.FC<SimpleCameraMonitorProps> = ({
  isEnabled,
  onCameraReady,
  onViolation,
  onReport
}) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'pending'>('pending');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [lastCheckTime, setLastCheckTime] = useState<number>(0);
  const [checkCount, setCheckCount] = useState<number>(0);
  const [successfulChecks, setSuccessfulChecks] = useState<number>(0);
  const [faceDetected, setFaceDetected] = useState<boolean>(false);
  const [brightness, setBrightness] = useState<number>(0);
  const [checkInterval, setCheckInterval] = useState<NodeJS.Timeout | null>(null);
  const [motionLevel, setMotionLevel] = useState<number>(0);
  const [lastImageData, setLastImageData] = useState<ImageData | null>(null);
  const [multiplePersons, setMultiplePersons] = useState<boolean>(false);
  const [deviceDetected, setDeviceDetected] = useState<boolean>(false);
  const [processingFrame, setProcessingFrame] = useState<boolean>(false);
  const [facePosition, setFacePosition] = useState<{x: number, y: number, size: number} | null>(null);
  
  // Violation tracking with cooldown
  const violationCooldowns = useRef<{[key: string]: number}>({
    face_not_detected: 0,
    multiple_faces: 0,
    electronic_device: 0
  });
  
  // Violation confirmation counters (to reduce false positives)
  const violationConfirmation = useRef<{[key: string]: number}>({
    face_not_detected: 0,
    multiple_faces: 0,
    electronic_device: 0
  });
  
  // Request camera permission
  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
          frameRate: { ideal: 15 }
        } 
      });
      setCameraPermission('granted');
      onCameraReady(true);
      toast.success('📹 Camera access granted');
      
      // Stop the stream to avoid multiple active streams
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Camera permission denied:', error);
      setCameraPermission('denied');
      onCameraReady(false);
      toast.error('Camera access is required for monitoring');
    }
  };

  // Handle successful camera initialization
  const handleUserMedia = () => {
    setCameraPermission('granted');
    onCameraReady(true);
    startMonitoring();
  };

  // Handle camera error
  const handleUserMediaError = (error: string | DOMException) => {
    console.error('Camera error:', error);
    setCameraPermission('denied');
    onCameraReady(false);
    toast.error('Failed to access camera. Please check permissions.');
  };

  // Start monitoring
  const startMonitoring = () => {
    if (!isEnabled || !webcamRef.current || checkInterval) return;
    
    console.log('🚀 Starting camera monitoring...');
    setIsMonitoring(true);
    setSessionStartTime(Date.now());
    
    // Set up periodic checks - more frequent for smoother experience
    const interval = setInterval(() => {
      if (!processingFrame) {
        setProcessingFrame(true);
        checkPresence();
      }
    }, 800); // Check every 800ms for better performance
    
    setCheckInterval(interval);
  };

  // Stop monitoring
  const stopMonitoring = () => {
    if (checkInterval) {
      clearInterval(checkInterval);
      setCheckInterval(null);
    }
    
    setIsMonitoring(false);
    
    // Generate and send report
    if (onReport && checkCount > 0) {
      const report = {
        sessionDuration: (Date.now() - sessionStartTime) / 1000, // in seconds
        totalChecks: checkCount,
        successfulChecks: successfulChecks,
        presenceRate: Math.round((successfulChecks / Math.max(checkCount, 1)) * 100),
        averageBrightness: brightness,
        motionLevel: motionLevel,
        multiplePersonsDetected: multiplePersons,
        deviceDetected: deviceDetected,
        startTime: new Date(sessionStartTime).toISOString(),
        endTime: new Date().toISOString(),
        overallScore: Math.round((successfulChecks / Math.max(checkCount, 1)) * 100)
      };
      
      onReport(report);
    }
  };

  // Report violation with cooldown and confirmation
  const reportViolation = (type: string, cooldownMs: number, requiredConfirmations: number) => {
    const now = Date.now();
    
    // Check cooldown
    if (now - violationCooldowns.current[type] < cooldownMs) {
      return;
    }
    
    // Increment confirmation counter
    violationConfirmation.current[type] += 1;
    
    // Only report if we have enough confirmations
    if (violationConfirmation.current[type] >= requiredConfirmations) {
      // Reset confirmation counter
      violationConfirmation.current[type] = 0;
      
      // Set cooldown
      violationCooldowns.current[type] = now;
      
      // Report violation
      if (onViolation) {
        onViolation(type);
      }
    }
  };

  // Check for presence using advanced pixel analysis
  const checkPresence = () => {
    if (!webcamRef.current || !webcamRef.current.video) {
      setProcessingFrame(false);
      return;
    }
    
    const video = webcamRef.current.video;
    
    // Only process if video is playing
    if (video.readyState !== 4) {
      setProcessingFrame(false);
      return;
    }
    
    try {
      // Draw video frame to canvas for analysis
      const canvas = canvasRef.current;
      if (!canvas) {
        setProcessingFrame(false);
        return;
      }
      
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        setProcessingFrame(false);
        return;
      }
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data for analysis - use a smaller sample for better performance
      // Focus on the center area where the face is most likely to be
      const centerX = Math.floor(canvas.width / 2);
      const centerY = Math.floor(canvas.height / 2);
      const sampleWidth = Math.floor(canvas.width * 0.6); // 60% of width
      const sampleHeight = Math.floor(canvas.height * 0.6); // 60% of height
      const sampleX = centerX - Math.floor(sampleWidth / 2);
      const sampleY = centerY - Math.floor(sampleHeight / 2);
      
      const imageData = ctx.getImageData(
        sampleX, 
        sampleY, 
        sampleWidth, 
        sampleHeight
      );
      
      const data = imageData.data;
      
      // Advanced analysis with grid-based sampling
      const gridSize = 12; // Smaller grid for better performance
      const cellWidth = Math.floor(sampleWidth / gridSize);
      const cellHeight = Math.floor(sampleHeight / gridSize);
      
      let totalBrightness = 0;
      let pixelCount = 0;
      let motionScore = 0;
      
      // Create a brightness map for face detection and multiple person detection
      const brightnessMap = Array(gridSize).fill(0).map(() => Array(gridSize).fill(0));
      const motionMap = Array(gridSize).fill(0).map(() => Array(gridSize).fill(0));
      
      // Sample pixels in a grid pattern
      for (let gridY = 0; gridY < gridSize; gridY++) {
        for (let gridX = 0; gridX < gridSize; gridX++) {
          // Sample center of each grid cell
          const x = Math.floor(gridX * cellWidth + cellWidth / 2);
          const y = Math.floor(gridY * cellHeight + cellHeight / 2);
          
          if (x >= 0 && x < sampleWidth && y >= 0 && y < sampleHeight) {
            const i = (y * sampleWidth + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Calculate brightness
            const brightness = (r + g + b) / 3;
            totalBrightness += brightness;
            pixelCount++;
            
            // Store in brightness map
            brightnessMap[gridY][gridX] = brightness;
            
            // Calculate motion if we have previous frame
            if (lastImageData) {
              // We need to map the coordinates from the current sample to the previous sample
              const prevX = x;
              const prevY = y;
              
              if (prevX >= 0 && prevX < lastImageData.width && prevY >= 0 && prevY < lastImageData.height) {
                const prevI = (prevY * lastImageData.width + prevX) * 4;
                const prevR = lastImageData.data[prevI];
                const prevG = lastImageData.data[prevI + 1];
                const prevB = lastImageData.data[prevI + 2];
                
                // Calculate pixel difference
                const diff = Math.abs(r - prevR) + Math.abs(g - prevG) + Math.abs(b - prevB);
                motionScore += diff;
                motionMap[gridY][gridX] = diff;
              }
            }
          }
        }
      }
      
      // Average brightness (0-255)
      const avgBrightness = totalBrightness / pixelCount;
      setBrightness(avgBrightness);
      
      // Average motion score
      const avgMotion = motionScore / pixelCount;
      setMotionLevel(avgMotion);
      
      // Face detection using brightness patterns and skin tone detection
      // Look for a region with significant brightness and color characteristics of skin
      let faceRegions = [];
      const faceThreshold = 15; // Lower threshold for better detection
      
      // Center region has higher weight for face detection
      const centerRegionWeight = 1.5;
      
      for (let gridY = 1; gridY < gridSize - 1; gridY++) {
        for (let gridX = 1; gridX < gridSize - 1; gridX++) {
          const centerBrightness = brightnessMap[gridY][gridX];
          
          // Check surrounding cells
          const surroundingCells = [
            brightnessMap[gridY-1][gridX], // top
            brightnessMap[gridY+1][gridX], // bottom
            brightnessMap[gridY][gridX-1], // left
            brightnessMap[gridY][gridX+1], // right
          ];
          
          const avgSurroundingBrightness = surroundingCells.reduce((sum, val) => sum + val, 0) / surroundingCells.length;
          
          // Calculate distance from center of grid
          const centerDistX = Math.abs(gridX - gridSize/2) / (gridSize/2);
          const centerDistY = Math.abs(gridY - gridSize/2) / (gridSize/2);
          const centerDist = Math.sqrt(centerDistX*centerDistX + centerDistY*centerDistY);
          
          // Center regions get higher weight
          const centerWeight = 1 - (centerDist * centerRegionWeight);
          
          // If center is significantly different from surroundings, it might be a face
          // Apply center weight to favor central regions
          if (Math.abs(centerBrightness - avgSurroundingBrightness) * centerWeight > faceThreshold) {
            // Get actual pixel for skin tone check
            const pixelX = Math.floor(gridX * cellWidth + cellWidth / 2);
            const pixelY = Math.floor(gridY * cellHeight + cellHeight / 2);
            const pixelIndex = (pixelY * sampleWidth + pixelX) * 4;
            
            const r = data[pixelIndex];
            const g = data[pixelIndex + 1];
            const b = data[pixelIndex + 2];
            
            // Simple skin tone check (not perfect but helps reduce false positives)
            // Skin tones typically have R > G > B and R-G is within a certain range
            const isSkinTone = (r > g && g > b) && (r - g > 5 && r - g < 100);
            
            if (isSkinTone || centerBrightness > 100) {
              faceRegions.push({
                x: gridX * cellWidth + sampleX,
                y: gridY * cellHeight + sampleY,
                brightness: centerBrightness,
                diff: Math.abs(centerBrightness - avgSurroundingBrightness) * centerWeight,
                isSkinTone
              });
            }
          }
        }
      }
      
      // Sort regions by brightness difference (strongest first)
      faceRegions.sort((a, b) => b.diff - a.diff);
      
      // Check for multiple persons (multiple distinct face regions)
      const distinctRegions = [];
      const regionDistanceThreshold = 4; // Grid cells - reduced from 5
      
      for (const region of faceRegions) {
        let isDistinct = true;
        
        for (const existingRegion of distinctRegions) {
          const distance = Math.sqrt(
            Math.pow((region.x - existingRegion.x) / cellWidth, 2) +
            Math.pow((region.y - existingRegion.y) / cellHeight, 2)
          );
          
          if (distance < regionDistanceThreshold) {
            isDistinct = false;
            break;
          }
        }
        
        if (isDistinct) {
          distinctRegions.push(region);
        }
      }
      
      // Update multiple persons detection with confirmation
      const hasMultiplePersons = distinctRegions.length > 1;
      
      if (hasMultiplePersons) {
        // Require more confirmations for multiple persons to reduce false positives
        reportViolation('multiple_faces', 8000, 3); // 8 second cooldown, 3 confirmations
      } else {
        // Reset confirmation counter if not detected
        violationConfirmation.current.multiple_faces = 0;
      }
      
      setMultiplePersons(hasMultiplePersons);
      
      // Check for electronic devices (looking for bright spots with low motion)
      // Increased thresholds to reduce false positives
      const brightThreshold = 220; // Very bright (increased from 200)
      const deviceMotionThreshold = 3; // Low motion (reduced from 5)
      
      let deviceSpots = 0;
      
      for (let gridY = 0; gridY < gridSize; gridY++) {
        for (let gridX = 0; gridX < gridSize; gridX++) {
          if (brightnessMap[gridY][gridX] > brightThreshold && 
              (motionMap[gridY][gridX] === undefined || motionMap[gridY][gridX] < deviceMotionThreshold)) {
            deviceSpots++;
          }
        }
      }
      
      // Update device detection with confirmation
      const hasDevice = deviceSpots > 4; // Increased from 3
      
      if (hasDevice) {
        // Require more confirmations for device detection to reduce false positives
        reportViolation('electronic_device', 10000, 4); // 10 second cooldown, 4 confirmations
      } else {
        // Reset confirmation counter if not detected
        violationConfirmation.current.electronic_device = 0;
      }
      
      setDeviceDetected(hasDevice);
      
      // Determine if face is likely present based on all factors
      // Adjusted thresholds for better detection
      const isBrightnessOk = avgBrightness > 15 && avgBrightness < 245;
      const hasFaceRegion = faceRegions.length > 0;
      const hasMotion = avgMotion > 0.8; // Reduced from 1.5
      
      // More sophisticated presence detection
      let isProbablyPresent = false;
      
      if (isBrightnessOk && hasFaceRegion) {
        // If we have face regions and good brightness, likely present
        isProbablyPresent = true;
      } else if (isBrightnessOk && hasMotion && checkCount < 10) {
        // Early in the session, motion + good brightness is enough
        isProbablyPresent = true;
      } else if (faceRegions.some(r => r.isSkinTone)) {
        // If we detect skin tones, likely present
        isProbablyPresent = true;
      }
      
      // Update face position if detected
      if (isProbablyPresent && faceRegions.length > 0) {
        const mainFace = faceRegions[0];
        setFacePosition({
          x: mainFace.x,
          y: mainFace.y,
          size: cellWidth * 3 // Approximate face size
        });
      } else {
        setFacePosition(null);
      }
      
      // Update state
      setFaceDetected(isProbablyPresent);
      setCheckCount(prev => prev + 1);
      
      if (isProbablyPresent) {
        setSuccessfulChecks(prev => prev + 1);
        // Reset face not detected confirmation counter
        violationConfirmation.current.face_not_detected = 0;
      } else {
        // Report violation if face not detected with confirmation
        reportViolation('face_not_detected', 5000, 2); // 5 second cooldown, 2 confirmations
      }
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw detection visualization - subtle and smooth
      if (facePosition) {
        // Draw face indicator
        ctx.beginPath();
        ctx.arc(facePosition.x, facePosition.y, facePosition.size / 2, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Add a subtle glow effect
        ctx.shadowColor = 'rgba(34, 197, 94, 0.3)';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.2)';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      
      // Draw multiple persons warning if detected
      if (hasMultiplePersons && violationConfirmation.current.multiple_faces >= 2) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Multiple Persons Detected', canvas.width / 2, 30);
        
        // Highlight the regions
        distinctRegions.forEach(region => {
          ctx.beginPath();
          ctx.arc(region.x, region.y, cellWidth * 1.5, 0, 2 * Math.PI);
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      }
      
      // Draw device warning if detected
      if (hasDevice && violationConfirmation.current.electronic_device >= 3) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Electronic Device Detected', canvas.width / 2, hasMultiplePersons ? 60 : 30);
        
        // Highlight bright spots
        for (let gridY = 0; gridY < gridSize; gridY++) {
          for (let gridX = 0; gridX < gridSize; gridX++) {
            if (brightnessMap[gridY][gridX] > brightThreshold && 
                (motionMap[gridY][gridX] === undefined || motionMap[gridY][gridX] < deviceMotionThreshold)) {
              const x = gridX * cellWidth + sampleX + cellWidth / 2;
              const y = gridY * cellHeight + sampleY + cellHeight / 2;
              
              ctx.beginPath();
              ctx.arc(x, y, cellWidth / 2, 0, 2 * Math.PI);
              ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
              ctx.fill();
            }
          }
        }
      }
      
      // Store current frame for motion detection
      setLastImageData(imageData);
      
    } catch (error) {
      console.error('Error in presence check:', error);
    }
    
    setProcessingFrame(false);
  };

  // Clean up on unmount or when disabled
  useEffect(() => {
    if (isEnabled) {
      // Initialize when enabled
      if (cameraPermission === 'granted') {
        startMonitoring();
      }
    } else {
      // Clean up when disabled
      stopMonitoring();
    }
    
    return () => {
      stopMonitoring();
    };
  }, [isEnabled, cameraPermission]);

  if (!isEnabled) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 transition-colors duration-200">
        <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400 transition-colors duration-200">
          <CameraOff className="h-5 w-5" />
          <span className="text-sm">Camera monitoring is disabled</span>
        </div>
      </div>
    );
  }

  if (cameraPermission === 'pending') {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6 transition-colors duration-200">
        <div className="text-center">
          <Camera className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-200">Camera Monitoring</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-200">
            Enable camera access for presence monitoring during your interview practice.
          </p>
          <button
            onClick={requestCameraPermission}
            className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
          >
            Enable Camera Monitoring
          </button>
        </div>
      </div>
    );
  }

  if (cameraPermission === 'denied') {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6 transition-colors duration-200">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-200">Camera Access Required</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-200">
            Camera monitoring requires camera access. Please enable permissions and refresh.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 dark:bg-red-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 dark:hover:bg-red-600 transition-colors duration-200"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 transition-colors duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${isMonitoring ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-700'} transition-colors duration-200`}>
            <Camera className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-200">Camera Monitoring</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
              {isMonitoring ? 'Presence monitoring active' : 'Setting up monitoring...'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {faceDetected ? (
            <div className="flex items-center space-x-1 text-green-600 dark:text-green-400 transition-colors duration-200 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">
                Presence Detected
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-red-600 dark:text-red-400 transition-colors duration-200 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg">
              <EyeOff className="h-4 w-4" />
              <span className="text-sm font-medium">No Presence</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Camera Feed with Overlay */}
        <div className="lg:col-span-2">
          <div className="relative bg-black rounded-lg overflow-hidden shadow-md">
            <Webcam
              ref={webcamRef}
              audio={false}
              width={640}
              height={480}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                width: 640,
                height: 480,
                facingMode: 'user',
                frameRate: 15
              }}
              onUserMedia={handleUserMedia}
              onUserMediaError={handleUserMediaError}
              className="w-full h-auto"
              mirrored={true}
            />
            
            {/* Canvas overlay for visualization */}
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
              width={640}
              height={480}
            />
            
            {/* Status Overlays */}
            <div className="absolute top-2 left-2">
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                faceDetected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              } transition-all duration-300`}>
                {faceDetected ? '✓ Presence Detected' : '⚠ No Presence'}
              </div>
            </div>

            {/* Recording indicator */}
            {isMonitoring && (
              <div className="absolute top-2 right-2 flex items-center space-x-1 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>MONITORING</span>
              </div>
            )}

            {/* Multiple persons warning */}
            {multiplePersons && violationConfirmation.current.multiple_faces >= 2 && (
              <div className="absolute top-10 right-2 flex items-center space-x-1 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                <Users className="h-3 w-3" />
                <span>MULTIPLE PERSONS</span>
              </div>
            )}

            {/* Device warning */}
            {deviceDetected && violationConfirmation.current.electronic_device >= 3 && (
              <div className="absolute top-18 right-2 flex items-center space-x-1 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                <Shield className="h-3 w-3" />
                <span>DEVICE DETECTED</span>
              </div>
            )}

            {/* Session Timer */}
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
              <Clock className="h-3 w-3 inline mr-1" />
              {sessionStartTime > 0 ? 
                `${Math.floor((Date.now() - sessionStartTime) / 1000 / 60)}:${String(Math.floor(((Date.now() - sessionStartTime) / 1000) % 60)).padStart(2, '0')}` : 
                '0:00'}
            </div>
          </div>
        </div>

        {/* Monitoring Dashboard */}
        <div className="space-y-3">
          {/* Status */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 transition-colors duration-200">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-200">Monitoring Status</h4>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400 transition-colors duration-200">Presence Rate:</span>
                <span className={`font-medium ${
                  checkCount === 0 ? 'text-gray-600 dark:text-gray-400' :
                  (successfulChecks / checkCount) > 0.8 ? 'text-green-600 dark:text-green-400' :
                  (successfulChecks / checkCount) > 0.5 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                } transition-colors duration-200`}>
                  {checkCount === 0 ? 'N/A' : `${Math.round((successfulChecks / checkCount) * 100)}%`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400 transition-colors duration-200">Checks:</span>
                <span className="font-medium text-blue-600 dark:text-blue-400 transition-colors duration-200">
                  {successfulChecks}/{checkCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400 transition-colors duration-200">Brightness:</span>
                <span className={`font-medium ${
                  brightness < 30 ? 'text-red-600 dark:text-red-400' :
                  brightness > 220 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-green-600 dark:text-green-400'
                } transition-colors duration-200`}>
                  {Math.round(brightness)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400 transition-colors duration-200">Motion:</span>
                <span className={`font-medium ${
                  motionLevel < 1 ? 'text-yellow-600 dark:text-yellow-400' :
                  motionLevel > 20 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-green-600 dark:text-green-400'
                } transition-colors duration-200`}>
                  {motionLevel < 1 ? 'Low' : motionLevel > 20 ? 'High' : 'Normal'}
                </span>
              </div>
            </div>
          </div>

          {/* Violations */}
          <div className="bg-white dark:bg-gray-750 rounded-lg p-3 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-200">Monitoring Checks</h4>
            <div className="space-y-2">
              <div className={`flex items-center justify-between p-2 rounded ${
                faceDetected ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' : 
                'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
              } transition-colors duration-300`}>
                <div className="flex items-center space-x-2">
                  {faceDetected ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <span className="text-sm">Face Presence</span>
                </div>
                <span className="text-xs font-medium">{faceDetected ? 'Detected' : 'Not Detected'}</span>
              </div>
              
              <div className={`flex items-center justify-between p-2 rounded ${
                !multiplePersons || violationConfirmation.current.multiple_faces < 2 ? 
                  'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' : 
                  'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
              } transition-colors duration-300`}>
                <div className="flex items-center space-x-2">
                  {!multiplePersons || violationConfirmation.current.multiple_faces < 2 ? 
                    <CheckCircle className="h-4 w-4" /> : 
                    <Users className="h-4 w-4" />
                  }
                  <span className="text-sm">Multiple Persons</span>
                </div>
                <span className="text-xs font-medium">
                  {multiplePersons && violationConfirmation.current.multiple_faces >= 2 ? 
                    'Detected' : 'None'}
                </span>
              </div>
              
              <div className={`flex items-center justify-between p-2 rounded ${
                !deviceDetected || violationConfirmation.current.electronic_device < 3 ? 
                  'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' : 
                  'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
              } transition-colors duration-300`}>
                <div className="flex items-center space-x-2">
                  {!deviceDetected || violationConfirmation.current.electronic_device < 3 ? 
                    <CheckCircle className="h-4 w-4" /> : 
                    <Shield className="h-4 w-4" />
                  }
                  <span className="text-sm">Electronic Device</span>
                </div>
                <span className="text-xs font-medium">
                  {deviceDetected && violationConfirmation.current.electronic_device >= 3 ? 
                    'Detected' : 'None'}
                </span>
              </div>
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 transition-colors duration-200">
            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2 transition-colors duration-200">Quick Tips</h4>
            <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 transition-colors duration-200">
              <li>• Stay visible in the camera frame</li>
              <li>• Ensure your face is well-lit</li>
              <li>• Be the only person in the frame</li>
              <li>• Keep electronic devices away</li>
            </ul>
          </div>
          
          {/* Session Stats */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-3 transition-colors duration-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-purple-900 dark:text-purple-300 transition-colors duration-200">Session Duration</h4>
              <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                {sessionStartTime > 0 ? 
                  `${Math.floor((Date.now() - sessionStartTime) / 1000 / 60)}:${String(Math.floor(((Date.now() - sessionStartTime) / 1000) % 60)).padStart(2, '0')}` : 
                  '0:00'}
              </span>
            </div>
            
            {/* Progress bar for presence rate */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1 overflow-hidden">
              <div 
                className="bg-purple-600 dark:bg-purple-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${checkCount === 0 ? 0 : Math.round((successfulChecks / checkCount) * 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-purple-800 dark:text-purple-200 text-right">
              Presence Score: {checkCount === 0 ? 'N/A' : `${Math.round((successfulChecks / checkCount) * 100)}%`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};