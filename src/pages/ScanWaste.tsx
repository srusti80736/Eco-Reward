import { useState, useEffect, useRef } from "react";
import { Camera, CheckCircle2, RotateCcw, XCircle, Loader2, Award, Zap, CameraIcon, UploadCloud, Info, Usb, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

// ML Imports
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

type ScanMode = "SELECT" | "CAMERA" | "UPLOAD";
type ScanState = "LOADING_MODEL" | "IDLE" | "CAPTURING" | "CLASSIFYING" | "VERIFYING_DISPOSAL" | "SUCCESS" | "FAILED";
type WasteClass = "cardboard" | "plastic" | "glass" | "metal" | "paper" | "unknown" | null;

// Helper to map generic MobileNet ImageNet classes to our 5 waste types
const mapPredictionToWasteType = (predictionName: string): WasteClass => {
  const name = predictionName.toLowerCase();

  // Broader keyword arrays for better MobileNet matching
  const plasticKeywords = [
    'bottle', 'plastic', 'cup', 'wrapper', 'bag', 'jug', 'water bottle',
    'pop bottle', 'soda bottle', 'tupperware', 'container', 'poly', 'shaker',
    'pitcher', 'ewer', 'bucket', 'pail', 'lotion', 'spray', 'vial',
    'canister', 'thermos', 'barrel', 'drum', 'nipple', 'measuring', 'soap dispenser'
  ];
  const glassKeywords = ['glass', 'jar', 'window', 'goblet', 'wine', 'beer glass', 'beaker', 'flask', 'lens', 'sunglasses', 'goggles', 'mirror', 'pitcher'];
  const metalKeywords = ['can', 'tin', 'metal', 'aluminum', 'steel', 'iron', 'copper', 'brass', 'silver', 'gold', 'foil', 'pan', 'pot', 'cutlery', 'spoon', 'fork', 'knife'];
  const cardboardKeywords = ['box', 'carton', 'cardboard', 'package', 'shipping', 'corrugated', 'pizza box', 'cereal box'];
  const paperKeywords = ['paper', 'book', 'envelope', 'document', 'newspaper', 'magazine', 'receipt', 'ticket', 'flyer', 'brochure', 'notebook', 'diary', 'journal', 'menu', 'scroll'];

  if (plasticKeywords.some(keyword => name.includes(keyword))) return 'plastic';
  if (glassKeywords.some(keyword => name.includes(keyword))) return 'glass';
  if (metalKeywords.some(keyword => name.includes(keyword))) return 'metal';
  if (cardboardKeywords.some(keyword => name.includes(keyword))) return 'cardboard';
  if (paperKeywords.some(keyword => name.includes(keyword))) return 'paper';

  return 'unknown';
};

const ScanWaste = () => {
  const [scanMode, setScanMode] = useState<ScanMode>("SELECT");
  const [scanState, setScanState] = useState<ScanState>("LOADING_MODEL");
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [wasteType, setWasteType] = useState<WasteClass>(null);
  const [rawPrediction, setRawPrediction] = useState<string>("");
  const [pointsEarned, setPointsEarned] = useState(0);
  const [processedImages, setProcessedImages] = useState<Set<string>>(new Set());

  // Advanced Telemetry States
  const [irSensorStatus, setIrSensorStatus] = useState("Awaiting Drop...");
  const [verificationProgress, setVerificationProgress] = useState(0);

  // Arduino Web Serial States
  const [serialPort, setSerialPort] = useState<any>(null);
  const [isSerialConnected, setIsSerialConnected] = useState(false);
  const readerRef = useRef<any>(null);

  const [model, setModel] = useState<mobilenet.MobileNet | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const userName = location.state?.userName || "Authentication Officer";
  const userEmail = location.state?.userEmail || "guest@eco.com";

  // Check if we arrived here from the Authentication login flow
  // In a real app this would check user context/session
  const isAuthRole = location.state?.fromRole === "Authentication" || true; // Assuming true for demo purposes to show button

  const savePointsToStats = (points: number, type: string) => {
    const storageKey = `eco_user_stats_${userEmail}`;
    const storedStats = localStorage.getItem(storageKey);
    if (storedStats) {
      const stats = JSON.parse(storedStats);
      stats.points += points;
      stats.disposals += 1;
      if (stats.disposals % 5 === 0) stats.badges += 1; // Award a badge every 5 disposals
      
      const newActivity = {
        id: Date.now(),
        type: type,
        points: points,
        time: "Just now",
        status: "verified"
      };
      stats.history = [newActivity, ...stats.history];
      
      // Update chart for today
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const today = dayNames[new Date().getDay()];
      const dayEntry = stats.weeklyData.find((d: any) => d.day === today);
      if (dayEntry) dayEntry.points += points;
      
      localStorage.setItem(storageKey, JSON.stringify(stats));
    }
  };

  // 1. Load the MobileNet Model
  const loadModel = async () => {
    try {
      await tf.ready();
      const loadedModel = await mobilenet.load({ version: 2, alpha: 1.0 });
      setModel(loadedModel);
      setScanState("IDLE");
      return loadedModel;
    } catch (err) {
      console.error("Failed to load model", err);
      toast.error("Failed to load AI model. Please check connectivity.");
      setScanState("FAILED");
      return null;
    }
  };

  useEffect(() => {
    loadModel();
  }, []);

  // Heartbeat to keep tab active during long idle periods (e.g. 115 mins)
  useEffect(() => {
    const keepAliveInterval = setInterval(() => {
      // Small non-intrusive tick to prevent aggressive browser suspension
      console.log("[System] Keep-alive ping...");
      if (model === null && scanState === "IDLE") {
        loadModel(); // Try to reload if it was lost
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(keepAliveInterval);
  }, [model, scanState]);

  // 2. Start Camera Feed when in CAMERA mode
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      if (scanMode === "CAMERA" && scanState === "IDLE") {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        } catch (err) {
          console.error("Camera access denied", err);
          toast.error("Camera access is required for live scanning.");
          setScanMode("SELECT");
        }
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [scanMode, scanState]);

  // IoT Sensor Simulation / Arduino Logic
  useEffect(() => {
    let isActive = true;
    let uiUpdateInterval: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;

    if (scanState === "VERIFYING_DISPOSAL") {
      let progress = 0;

      // Telemetry UI simulation
      uiUpdateInterval = setInterval(() => {
        if (progress < 25) {
          setIrSensorStatus("Proximity: Near (Human present)");
        } else if (progress < 60) {
          setIrSensorStatus("Proximity: Dropping item detected...");
        } else if (progress < 100) {
          setIrSensorStatus("Proximity: Clear");
        }
      }, 500);

      // If Arduino is connected, read from Serial Port
      if (isSerialConnected && serialPort) {
         setIrSensorStatus("Proximity: Awaiting Arduino IR Sensor...");
         setVerificationProgress(50); // Pause progress indicator

         const readSerial = async () => {
             try {
               const reader = serialPort.readable.getReader();
               readerRef.current = reader;
               const decoder = new TextDecoder();
               let buffer = "";

               while (isActive) {
                 const { value, done } = await reader.read();
                 if (done) break;
                 
                 buffer += decoder.decode(value, { stream: true });
                 
                 // We will look for the specific word "DETECTED" from the Arduino
                 // to avoid false positives if the Arduino is constantly printing 0 or 1.
                 if (buffer.toUpperCase().includes('DETECTED')) {
                    clearInterval(uiUpdateInterval);
                    setIrSensorStatus("Proximity: Arduino IR Detected Drop!");
                    setVerificationProgress(100);
                    
                    setTimeout(() => {
                      if (!isActive) return;
                      const rewardMap: Record<string, number> = {
                        'plastic': 25, 'glass': 30, 'metal': 40, 'cardboard': 20, 'paper': 10, 'unknown': 5
                      };
                      const basePoints = wasteType ? (rewardMap[wasteType] || 10) : 10;
                      setPointsEarned(basePoints);
                      savePointsToStats(basePoints, wasteType || "unknown");
                      setScanState("SUCCESS");
                    }, 1000);
                    break;
                 }
                 
                 // Prevent buffer from growing infinitely
                 if (buffer.length > 1000) {
                   buffer = buffer.slice(-100);
                 }
               }
             } catch (error) {
               console.error("Serial read error:", error);
             } finally {
               if (readerRef.current) {
                 readerRef.current.releaseLock();
                 readerRef.current = null;
               }
             }
         };
         readSerial();

      } else {
        // Fallback: If no Arduino connected, fallback to old simulated logic
        progressInterval = setInterval(() => {
          progress += 5;
          setVerificationProgress(progress);
          
          if (progress >= 100) {
            clearInterval(progressInterval);
            clearInterval(uiUpdateInterval);
            setIrSensorStatus("Proximity: Clear");

            // Simulate 90% success rate for proper disposal
            const isSuccessful = Math.random() > 0.1;
            if (isSuccessful) {
              // Give points mostly if we recognized it as something recyclable
              const rewardMap: Record<string, number> = {
                'plastic': 25, 'glass': 30, 'metal': 40, 'cardboard': 20, 'paper': 10, 'unknown': 5
              };
              const basePoints = wasteType ? (rewardMap[wasteType] || 10) : 10;

              setPointsEarned(basePoints);
              savePointsToStats(basePoints, wasteType || "unknown");
              setScanState("SUCCESS");
            } else {
              setScanState("FAILED");
            }
          }
        }, 150); // Fast but visibly progressing
      }
    }

    return () => {
      isActive = false;
      clearInterval(progressInterval);
      clearInterval(uiUpdateInterval);
      if (readerRef.current) {
        // Cancel the reader so it stops blocking
        readerRef.current.cancel().catch(console.error);
        // Do not nullify here; let the finally block in readSerial release the lock
      }
    };
  }, [scanState, wasteType, isSerialConnected, serialPort]);

  const processClassification = async (inputElement: HTMLVideoElement | HTMLImageElement, currentModel = model) => {
    if (!currentModel) return;

    setScanState("CLASSIFYING");

    try {
      const predictions = await currentModel.classify(inputElement);
      console.log("MobileNet Predictions:", predictions);

      if (predictions && predictions.length > 0) {
        const topPrediction = predictions[0].className;
        setRawPrediction(topPrediction); // Keep original text for UI context

        // Map to our 5 Kaggle classes
        const mappedClass = mapPredictionToWasteType(topPrediction);
        setWasteType(mappedClass);
      } else {
        setWasteType("unknown");
        setRawPrediction("Unrecognizable item");
      }

      // Delay slightly for visual effect
      setTimeout(() => {
        setScanState("VERIFYING_DISPOSAL");
      }, 1200);

    } catch (err) {
      console.error("Classification failed, attempting recovery...", err);
      try {
         // If WebGL context was lost or model crashed due to long idle time, try to reload and classify again
         toast.info("Re-initializing AI after long idle time...");
         const reloadedModel = await loadModel();
         if (reloadedModel) {
             const retryPredictions = await reloadedModel.classify(inputElement);
             if (retryPredictions && retryPredictions.length > 0) {
                 setRawPrediction(retryPredictions[0].className);
                 setWasteType(mapPredictionToWasteType(retryPredictions[0].className));
             } else {
                 setWasteType("unknown");
                 setRawPrediction("Unrecognizable item");
             }
             setTimeout(() => {
               setScanState("VERIFYING_DISPOSAL");
             }, 1200);
             return;
         }
      } catch (retryErr) {
         console.error("Recovery failed", retryErr);
      }
      
      toast.error("Failed to analyze image. Please refresh the page.");
      setScanState("IDLE");
    }
  };

  const handleCameraCapture = () => {
    if (videoRef.current) processClassification(videoRef.current);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileSignature = `${file.name}-${file.size}-${file.lastModified}`;
      
      if (processedImages.has(fileSignature)) {
        toast.error("You cannot upload the same image twice. Reward cannot be generated.", {
          duration: 4000,
        });
        event.target.value = "";
        return;
      }
      
      setProcessedImages(prev => new Set(prev).add(fileSignature));

      const imageUrl = URL.createObjectURL(file);
      if (imageRef.current) {
        imageRef.current.onload = () => {
          setScanMode("UPLOAD");
          // Process the image right after it loads onto the DOM
          processClassification(imageRef.current!);
        };
        imageRef.current.src = imageUrl;
      }
    }
    // Clear input so the same file can be selected again
    event.target.value = "";
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const connectArduino = async () => {
    try {
      if (!('serial' in navigator)) {
        toast.error("Web Serial API not supported in this browser. Please use Chrome or Edge.");
        return;
      }
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 9600 });
      setSerialPort(port);
      setIsSerialConnected(true);
      toast.success("Arduino Connected Successfully!");
    } catch (err) {
      console.error("Failed to connect to Arduino", err);
      toast.error("Could not connect to Arduino.");
    }
  };

  const resetState = () => {
    setScanMode("SELECT");
    setScanState("IDLE");
    setWasteType(null);
    setRawPrediction("");
    setVerificationProgress(0);
    setPointsEarned(0);
    setIrSensorStatus("Awaiting Drop...");
    if (imageRef.current) imageRef.current.src = "";
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 pb-12 font-sans text-white px-4">

      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileUpload}
      />
      {/* Hidden image element to load the uploaded file for prediction */}
      <img ref={imageRef} className="absolute w-10 h-10 opacity-0 pointer-events-none" alt="uploaded waste" crossOrigin="anonymous" />


      <div className="text-center mb-8 h-16 w-full max-w-sm">
        <h1 className="text-3xl font-bold mb-2">Scan Your Waste</h1>
        <p className="text-slate-400">
          {scanState === "LOADING_MODEL" && "Waking up AI model..."}
          {scanState === "IDLE" && scanMode === "SELECT" && "Choose detection method"}
          {scanState === "IDLE" && scanMode === "CAMERA" && "Position item in frame"}
          {scanMode === "UPLOAD" && "Analyzing uploaded image..."}
        </p>
      </div>

      {/* Main Interface Area */}
      <div className="relative w-full max-w-sm aspect-[3/4] bg-slate-950 rounded-[2rem] overflow-hidden shadow-2xl shadow-green-900/10 border border-slate-800 flex flex-col items-center justify-center transition-all duration-300">

        {scanState === "LOADING_MODEL" && (
          <div className="flex flex-col items-center gap-4 text-center p-6 text-slate-300">
            <Loader2 className="h-12 w-12 animate-spin text-[#22c55e]" />
            <p className="font-medium text-sm">Loading Neural Network (MobileNet) <br />for on-device edge classification...</p>
          </div>
        )}

        {/* 1. SELECTION SCREEN */}
        {scanState === "IDLE" && scanMode === "SELECT" && (
          <div className="flex flex-col w-full h-full p-6 space-y-4 justify-center">
            <Button
              onClick={() => setScanMode("CAMERA")}
              className="w-full h-32 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 flex flex-col gap-3 group"
            >
              <div className="h-12 w-12 rounded-full bg-[#22c55e]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CameraIcon className="h-6 w-6 text-[#22c55e]" />
              </div>
              <span className="font-bold text-lg">Use Live Camera</span>
            </Button>

            <div className="flex items-center gap-4 text-slate-500 text-sm font-medium w-full">
              <div className="flex-1 h-px bg-slate-800"></div>
              OR
              <div className="flex-1 h-px bg-slate-800"></div>
            </div>

            <Button
              onClick={triggerFileInput}
              className="w-full h-32 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 flex flex-col gap-3 group"
            >
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <UploadCloud className="h-6 w-6 text-blue-500" />
              </div>
              <span className="font-bold text-lg">Upload Image File</span>
            </Button>
          </div>
        )}

        {/* 2. LIVE CAMERA VIEW */}
        {(scanState === "IDLE" && scanMode === "CAMERA") && (
          <>
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
              muted
            />
            {/* Viewfinder overlay */}
            <div className="absolute inset-0 border-[3px] border-black/10 z-10 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-dashed border-white/50 rounded-2xl z-20"></div>
            <div className="absolute bottom-6 w-full px-6 z-30 flex gap-4">
              <Button
                variant="outline"
                onClick={resetState}
                className="flex-1 h-16 rounded-2xl border-2 border-white/20 bg-black/50 text-white backdrop-blur-md"
              >
                Back
              </Button>
              <Button
                onClick={handleCameraCapture}
                className="flex-[2] h-16 rounded-2xl bg-[#22c55e] text-white text-lg font-bold shadow-lg shadow-[#22c55e]/30"
              >
                <CameraIcon className="h-6 w-6 mr-2" />
                Classify
              </Button>
            </div>
          </>
        )}

        {/* UPLOADED IMAGE BACKGROUND */}
        {(scanMode === "UPLOAD" && imageRef.current?.src) && (
          <>
            <img
              src={imageRef.current.src}
              className="absolute inset-0 w-full h-full object-cover z-0"
              alt="Uploaded context"
            />
            <div className="absolute inset-0 bg-slate-900/40 z-0 border-[3px] border-black/10 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"></div>
          </>
        )}

        {/* 3. CLASSIFYING/PROCESSING LAYER */}
        {scanState === "CLASSIFYING" && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-30 p-6 text-center">

            <div className="relative z-10 space-y-8 flex flex-col items-center">
              <div className="relative">
                <div className="h-32 w-32 rounded-full border-4 border-slate-700 border-t-[#22c55e] animate-spin flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.2)]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="h-10 w-10 text-[#22c55e] animate-pulse" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">AI Analysis</h2>
                <p className="text-[#22c55e] text-sm font-medium animate-pulse tracking-wide">EXTRACTING FEATURES...</p>
              </div>
            </div>
          </div>
        )}

        {/* 4. SENSOR VERIFICATION */}
        {scanState === "VERIFYING_DISPOSAL" && (
          <div className="flex flex-col items-start justify-between z-20 p-6 w-full h-full bg-slate-900/80 backdrop-blur-md border-t-[8px] border-[#22c55e]">

            {/* Model Results */}
            <div className="space-y-3 w-full animate-in slide-in-from-top-4">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Info className="h-4 w-4" />
                <span className="text-xs uppercase font-bold tracking-wider">Classification Result</span>
              </div>

              <div className="flex items-end justify-between bg-black/40 p-4 rounded-xl border border-slate-800">
                <div>
                  <h2 className="text-3xl font-black text-white capitalize">{wasteType}</h2>
                  <p className="text-slate-500 text-xs mt-1 truncate max-w-[180px]">Detected: {rawPrediction.split(',')[0]}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/50 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-[#22c55e]" />
                </div>
              </div>
            </div>

            {/* Sensor Telemetry Panel */}
            <div className="w-full space-y-4">
              <p className="text-[#22c55e] text-sm font-bold flex items-center gap-2 animate-pulse mb-4">
                <Loader2 className="h-4 w-4 animate-spin" /> Verifying Physical Drop
              </p>

              <div className="space-y-3 p-4 bg-slate-800/80 rounded-xl border border-slate-700">
                {/* IR Sensor Row */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">IR Proximity Sensor</span>
                  <span className="text-white font-medium text-xs bg-slate-700 px-2 py-1 rounded">{irSensorStatus}</span>
                </div>
              </div>

              {/* Unified Progress Bar */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <span>Telemetry Sync</span>
                  <span>{verificationProgress}%</span>
                </div>
                <Progress value={verificationProgress} className="h-1.5 [&>div]:bg-[#22c55e]" />
              </div>
            </div>
          </div>
        )}

        {/* 5. SUCCESS UI */}
        {scanState === "SUCCESS" && (
          <div className="flex flex-col items-center justify-center z-20 p-8 text-center animate-in zoom-in duration-300 bg-gradient-to-b from-emerald-900/90 to-slate-900/90 backdrop-blur-md absolute inset-0">
            <div className="h-24 w-24 rounded-full bg-emerald-500 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(16,185,129,0.5)] ring-4 ring-emerald-500/30">
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>

            <Badge variant="outline" className="text-emerald-300 border-emerald-500/50 mb-3 uppercase tracking-widest text-[10px]">VERIFIED DISPOSAL</Badge>
            <h2 className="text-3xl font-black text-white mb-2">{wasteType}</h2>
            <p className="text-emerald-100/70 text-sm mb-8 px-4">IR sensor confirmed the physical drop successfully.</p>

            <div className="w-full bg-black/60 p-5 rounded-2xl border border-yellow-500/30 flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-white shadow-inner">
                  <Award className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Earned Reward</p>
                  <p className="text-3xl font-black text-white">{pointsEarned} <span className="text-lg text-yellow-500 font-bold">PTS</span></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. FAIL UI */}
        {scanState === "FAILED" && (
          <div className="flex flex-col items-center justify-center z-20 p-8 text-center border-t-8 border-red-500 animate-in zoom-in-95 duration-300 bg-slate-900/90 backdrop-blur-md absolute inset-0">
            <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Verification Failed</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              We analyzed the item as <strong>{wasteType}</strong>, but our physical IR sensor did not detect an expected drop in the bin.
            </p>
            <div className="mt-6 p-3 bg-slate-800 rounded-lg text-xs font-mono text-slate-500 w-full text-left">
              ERR_TELEMETRY_MISMATCH
            </div>
          </div>
        )}
      </div>

      {/* Global Bottom Actions (only if done) */}
      <div className="w-full max-w-sm mt-8 space-y-3">
        {(scanState === "SUCCESS" || scanState === "FAILED") && (
          <>
            <Button
              onClick={resetState}
              className="w-full h-14 rounded-xl bg-white text-slate-900 text-base font-bold hover:bg-slate-200 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <RotateCcw className="h-5 w-5" /> Scan Another Item
            </Button>
            <Button
              onClick={() => navigate("/dashboard", { state: { userName, userEmail } })}
              variant="outline"
              className="w-full h-14 rounded-xl border-slate-700 bg-transparent text-slate-400 hover:bg-slate-800 hover:text-white transition-all font-medium"
            >
              Return to User Dashboard
            </Button>

            {isAuthRole && (
              <Button
                onClick={() => navigate("/auth-dashboard", { state: { userName } })}
                variant="ghost"
                className="w-full h-14 rounded-xl text-emerald-400 hover:bg-emerald-950/30 hover:text-emerald-300 transition-all font-medium border border-emerald-900/50"
              >
                View Auth Telemetry Dashboard
              </Button>
            )}
          </>
        )}
      </div>

      {/* Hidden Kiosk Setup Button for Demo Purposes */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
           variant="ghost" 
           size="icon"
           className="text-slate-700 hover:text-slate-400 hover:bg-slate-800 rounded-full h-10 w-10 transition-colors"
           onClick={() => setShowAdminPanel(!showAdminPanel)}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {showAdminPanel && (
        <div className="fixed bottom-16 right-4 z-50 bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-2xl w-72 animate-in slide-in-from-bottom-4 duration-300">
           <div className="flex justify-between items-center mb-2">
             <h3 className="text-white font-bold text-sm">Kiosk Setup</h3>
             <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-slate-700 text-slate-400" onClick={() => setShowAdminPanel(false)}>
                <XCircle className="h-4 w-4" />
             </Button>
           </div>
           <p className="text-slate-400 text-xs mb-4">Pair the physical Arduino bin sensor via USB. This should only be done once by the admin.</p>
           <Button 
             onClick={connectArduino}
             variant="outline"
             className={`w-full h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-sm ${
               isSerialConnected 
               ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' 
               : 'border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700'
             }`}
           >
             <Usb className="h-4 w-4" />
             {isSerialConnected ? 'Sensor Connected (COM)' : 'Pair Arduino Sensor'}
           </Button>
        </div>
      )}

    </div>
  );
};

// Quick shim for badge if it wasn't used natively inside the component tree deeply
const Badge = ({ children, variant, className }: { children: React.ReactNode, variant?: string, className?: string }) => {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className}`}>{children}</span>
}

export default ScanWaste;
