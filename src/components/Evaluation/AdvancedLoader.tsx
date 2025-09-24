import React from 'react';
import { Brain, Zap, Rocket, Star, Sparkles, Loader2, Code, Terminal, Server, Database, GitBranch, Cpu, Cloud } from 'lucide-react';

interface AdvancedLoaderProps {
  message?: string;
  subMessage?: string;
  showProgress?: boolean;
  progress?: number;
}

export const AdvancedLoader: React.FC<AdvancedLoaderProps> = ({
  message = "Preparing AI Evaluation",
  subMessage = "Checking API keys and initializing AI services...",
  showProgress = true,
  progress = 0
}) => {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#AFDDE5] dark:bg-[#003135] flex items-center justify-center">
      {/* Matrix effect */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 h-full w-0.5 bg-gradient-to-b from-[#0FA4AF]/20 via-[#024950]/30 to-transparent animate-matrix"
            style={{
              left: `${(i * 5.5 + 3)}%`,
              animationDelay: `${(i % 6) * 0.7}s`,
              animationDuration: `${2.5 + (i % 4) * 0.7}s`
            }}
          />
        ))}
      </div>
      {/* Animated floating dev/AI icons */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {/* AI/Dev icons, each with unique animation */}
        <div className="absolute left-[10%] top-[15%] animate-float-slow">
          <Brain className="h-10 w-10 text-[#0FA4AF]/80 drop-shadow-lg" />
        </div>
        <div className="absolute right-[12%] top-[25%] animate-float-medium">
          <Rocket className="h-8 w-8 text-[#964734]/80 rotate-12" />
        </div>
        <div className="absolute left-[20%] bottom-[18%] animate-float-fast">
          <Zap className="h-8 w-8 text-[#0FA4AF]/80 -rotate-12" />
        </div>
        <div className="absolute right-[18%] bottom-[12%] animate-float-medium">
          <Star className="h-7 w-7 text-[#024950]/80" />
        </div>
        <div className="absolute left-[50%] top-[8%] animate-float-slow">
          <Sparkles className="h-8 w-8 text-[#964734]/80" />
        </div>
        <div className="absolute left-[60%] bottom-[10%] animate-spin-slow">
          <Loader2 className="h-7 w-7 text-[#024950]/70" />
        </div>
        {/* Dev icons */}
        <div className="absolute left-[30%] top-[30%] animate-float-dev1">
          <Code className="h-8 w-8 text-[#0FA4AF]/80" />
        </div>
        <div className="absolute right-[30%] top-[18%] animate-float-dev2">
          <Terminal className="h-7 w-7 text-[#024950]/80" />
        </div>
        <div className="absolute left-[15%] bottom-[35%] animate-float-dev3">
          <Server className="h-8 w-8 text-[#0FA4AF]/80" />
        </div>
        <div className="absolute right-[22%] bottom-[30%] animate-float-dev4">
          <Database className="h-7 w-7 text-[#964734]/80" />
        </div>
        <div className="absolute left-[40%] top-[60%] animate-float-dev5">
          <GitBranch className="h-7 w-7 text-[#024950]/80" />
        </div>
        <div className="absolute right-[40%] bottom-[60%] animate-float-dev6">
          <Cpu className="h-8 w-8 text-[#0FA4AF]/80" />
        </div>
        <div className="absolute left-[70%] top-[40%] animate-float-dev7">
          <Cloud className="h-8 w-8 text-[#024950]/80" />
        </div>
        {/* Animated SVG lines/dots with moving packets */}
        <svg className="absolute inset-0 w-full h-full z-0" style={{ pointerEvents: 'none' }}>
          {/* Example animated line (Brain to Rocket) */}
          <line x1="12%" y1="17%" x2="88%" y2="27%" stroke="#0FA4AF" strokeWidth="2" strokeDasharray="6 6">
            <animate attributeName="stroke-dashoffset" from="0" to="12" dur="2s" repeatCount="indefinite" />
          </line>
          {/* Data packet on line */}
          <circle r="5" fill="#024950" >
            <animateMotion dur="2s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" path="M 12 17 Q 50 22 88 27" />
          </circle>
          {/* Example animated line (Zap to Star) */}
          <line x1="22%" y1="82%" x2="82%" y2="88%" stroke="#964734" strokeWidth="2" strokeDasharray="4 8">
            <animate attributeName="stroke-dashoffset" from="0" to="12" dur="1.5s" repeatCount="indefinite" />
          </line>
          <circle r="4" fill="#964734" >
            <animateMotion dur="1.5s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" path="M 22 82 Q 52 85 82 88" />
          </circle>
          {/* Example animated line (Sparkles to Brain) */}
          <line x1="50%" y1="10%" x2="10%" y2="17%" stroke="#0FA4AF" strokeWidth="2" strokeDasharray="5 7">
            <animate attributeName="stroke-dashoffset" from="0" to="12" dur="2.2s" repeatCount="indefinite" />
          </line>
          <circle r="3.5" fill="#0FA4AF" >
            <animateMotion dur="2.2s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" path="M 50 10 Q 30 13 10 17" />
          </circle>
        </svg>
      </div>
      {/* Floating loading message and progress bar */}
      <div className="absolute top-[28%] left-1/2 transform -translate-x-1/2 z-30 w-full max-w-lg flex flex-col items-center">
        <div className="px-6 py-4 mb-4 rounded-2xl bg-white/90 dark:bg-[#003135]/90 backdrop-blur-md shadow-lg text-center border border-[#AFDDE5]/30 dark:border-[#024950]">
          <h2 className="text-2xl font-bold text-[#003135] dark:text-[#AFDDE5] mb-2 drop-shadow-sm">
            {message}
          </h2>
          <p className="text-base text-[#024950] dark:text-[#AFDDE5]/80 leading-relaxed drop-shadow-sm">
            {subMessage}
          </p>
        </div>
        {showProgress && (
          <div className="w-full px-8">
            <div className="w-full bg-[#AFDDE5]/30 dark:bg-[#024950] rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-[#0FA4AF] rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-[#024950] dark:text-[#AFDDE5] mt-2">
              <span>Starting</span>
              <span className="font-medium">{progress}%</span>
              <span>Complete</span>
            </div>
          </div>
        )}
      </div>
      {/* Keyframes for floating animation and matrix */}
      <style>{`
        @keyframes float-slow {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.07); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes float-medium {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-18px) scale(1.04); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes float-fast {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.02); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes matrix {
          0% { transform: translateY(-100%); opacity: 0.2; }
          80% { opacity: 0.5; }
          100% { transform: translateY(100%); opacity: 0.1; }
        }
        .animate-float-slow { animation: float-slow 5s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 3.5s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 2.2s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 7s linear infinite; }
        .animate-matrix { animation: matrix linear infinite; }
        .animate-float-dev1 { animation: float-slow 6.2s 0.3s ease-in-out infinite; }
        .animate-float-dev2 { animation: float-medium 4.7s 0.7s ease-in-out infinite; }
        .animate-float-dev3 { animation: float-fast 3.8s 0.2s ease-in-out infinite; }
        .animate-float-dev4 { animation: float-slow 5.5s 0.5s ease-in-out infinite; }
        .animate-float-dev5 { animation: float-medium 4.2s 0.9s ease-in-out infinite; }
        .animate-float-dev6 { animation: float-fast 3.2s 0.6s ease-in-out infinite; }
        .animate-float-dev7 { animation: float-slow 5.8s 0.4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}; 