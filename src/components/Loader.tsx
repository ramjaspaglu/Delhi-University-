import React from "react";
import { motion } from "motion/react";
import { FileText, Search } from "lucide-react";

interface LoaderProps {
  message?: string;
  subMessage?: string;
}

export const ModernFluidLoader: React.FC<LoaderProps> = ({
  message = "Loading",
  subMessage = "Please wait a moment...",
}) => {
  return (
    <div className="w-full py-16 px-6 flex flex-col items-center justify-center space-y-8 text-center select-none bg-slate-50 rounded-none sm:rounded-none sm:rounded-apple-2xl border-y border-x-0 sm:border sm:border-x border-slate-200/80 font-sans">
      <div className="relative flex items-center justify-center w-16 h-16">
        <motion.div
          className="absolute inset-0 border-[3px] border-indigo-500/10 rounded-full"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-1 border-2 border-dashed border-indigo-600/30 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <Search className="text-indigo-600 z-10 animate-pulse" size={24} />
      </div>

      <div className="space-y-3">
        <h5 className="text-[11px] font-black text-slate-900 tracking-widest uppercase">
          {message}
        </h5>
        {subMessage && (
          <p className="text-[9.5px] text-slate-500 font-bold uppercase tracking-wider max-w-xs mx-auto leading-relaxed">
            {subMessage}
          </p>
        )}
      </div>

      {/* simulated progress bar */}
      <div className="w-48 h-1 bg-slate-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-indigo-600"
          initial={{ width: "0%" }}
          animate={{ width: ["0%", "40%", "70%", "100%", "0%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
};

export const AcademicDocLoader: React.FC<LoaderProps> = ({
  message,
  subMessage,
}) => (
  <ModernFluidLoader
    message={message || "Crawling Archive"}
    subMessage={subMessage || "Resolving indexes"}
  />
);

export const DigitalBeamScanner: React.FC<LoaderProps> = ({
  message,
  subMessage,
}) => (
  <ModernFluidLoader
    message={message || "Scraping Pages"}
    subMessage={subMessage || "Extracting embedded files"}
  />
);

export const RhythmicScanner: React.FC<{ label?: string }> = ({ label }) => (
  <ModernFluidLoader
    message={label || "Aggregating Data"}
    subMessage="Verifying payload hashes..."
  />
);

export const SkeletonCard: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 p-6 bg-white border-y border-x-0 sm:border sm:border-x border-slate-200/80 rounded-none sm:rounded-none sm:rounded-apple-xl animate-pulse h-full select-none shadow-sm">
      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center border-y border-x-0 sm:border sm:border-x border-slate-200/80" />
      <div className="w-full space-y-2 mt-2">
        <div className="h-2 bg-slate-200 rounded-full w-full" />
        <div className="h-2 bg-slate-200 rounded-full w-2/3" />
      </div>
    </div>
  );
};

export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div
      id="skeleton-grid"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {Array.from({ length: count }).map((_, i) => (
        <React.Fragment key={i}>
          <SkeletonCard />
        </React.Fragment>
      ))}
    </div>
  );
};
