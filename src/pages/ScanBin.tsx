import { useState, useEffect } from "react";
import { Camera, QrCode, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ScanBin = () => {
  const [isScanning, setIsScanning] = useState(true);
  const [scannedBin, setScannedBin] = useState<string | null>(null);
  const navigate = useNavigate();

  // Mocking a successful scan after 3 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isScanning) {
      timer = setTimeout(() => {
        setIsScanning(false);
        setScannedBin("BIN-0042 (Main Campus)");
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [isScanning]);

  const handleContinue = () => {
    if (scannedBin) {
      navigate("/scan-waste");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 pb-12 font-sans text-white">
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Connect to Dustbin</h1>
        <p className="text-slate-400">Scan the QR code on the physical bin</p>
      </div>

      {/* Camera Mockup Area */}
      <div className="relative w-full max-w-sm aspect-[3/4] bg-black rounded-3xl overflow-hidden shadow-2xl shadow-green-900/20 border-4 border-slate-800 flex items-center justify-center">
        
        {isScanning ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
            
            {/* Animated scanning line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-[#22c55e] z-20 shadow-[0_0_20px_#22c55e] animate-[scan_2s_ease-in-out_infinite_alternate]"></div>
            
            {/* Viewfinder brackets */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 z-20">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#22c55e] rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#22c55e] rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#22c55e] rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#22c55e] rounded-br-lg"></div>
            </div>

            <QrCode className="h-24 w-24 text-white/20 z-0 animate-pulse" />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center z-20 p-6 text-center animate-in zoom-in duration-300">
            <div className="h-20 w-20 rounded-full bg-[#22c55e]/20 flex items-center justify-center mb-6 border border-[#22c55e]/50">
              <QrCode className="h-10 w-10 text-[#22c55e]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Bin Connected!</h2>
            <p className="text-[#22c55e] font-medium text-lg bg-[#22c55e]/10 px-4 py-2 rounded-lg border border-[#22c55e]/20">{scannedBin}</p>
          </div>
        )}
      </div>

      {/* Status & Actions */}
      <div className="w-full max-w-sm mt-8 space-y-4 px-4">
        {isScanning ? (
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin text-[#22c55e]" />
            <span>Looking for QR code...</span>
          </div>
        ) : (
          <Button 
            onClick={handleContinue}
            className="w-full h-14 rounded-xl bg-[#22c55e] text-lg font-bold text-white hover:bg-green-600 transition-all shadow-lg shadow-[#22c55e]/20 group"
          >
            Next: Scan Waste 
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        )}
        
        <Button 
          variant="ghost" 
          onClick={() => navigate("/dashboard")}
          className="w-full text-slate-400 hover:text-white hover:bg-white/10"
        >
          Cancel
        </Button>
      </div>
      
    </div>
  );
};

export default ScanBin;
