import React from 'react';
import { motion } from 'motion/react';

interface LoaderProps {
  message?: string;
  subMessage?: string;
}

/**
 * Geometric Abstract Loader
 * A completely reinvented, purely visual loader focusing on elegant geometric rhythm
 * rather than system logs or fake terminal output.
 */
export const ModernFluidLoader: React.FC<LoaderProps> = ({
  message = "Loading",
  subMessage = "Please wait a moment..."
}) => {
  return (
    <div className="w-full max-w-sm mx-auto py-16 px-6 flex flex-col items-center justify-center space-y-10 text-center select-none">
      
      {/* Novel Animation: Elegant Abstract Geometry */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Pulsing halo */}
        <motion.div 
          className="absolute w-24 h-24 rounded-full bg-blue-100/50"
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Outer offset ring */}
        <motion.div 
          className="absolute w-20 h-20 border-t-2 border-l-2 border-slate-200 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />

        {/* Middle dashed ring */}
        <motion.div 
          className="absolute w-12 h-12 rounded-full border-2 border-dashed border-blue-400"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

        {/* Inner solid drop */}
        <motion.div 
          className="absolute w-4 h-4 bg-blue-600 rounded-full"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="space-y-2 relative">
        <h5 className="text-sm font-black text-slate-800 tracking-widest uppercase">
          {message}
        </h5>
        {subMessage && (
          <p className="text-xs text-slate-500 font-medium">
            {subMessage}
          </p>
        )}
      </div>
    </div>
  );
};


/**
 * Route existing legacy props to the newly invented loader 
 */
export const AcademicDocLoader: React.FC<LoaderProps> = ({ message, subMessage }) => (
  <ModernFluidLoader message={message || "Fetching Structure"} subMessage={subMessage} />
);

export const DigitalBeamScanner: React.FC<LoaderProps> = ({ message, subMessage }) => (
  <ModernFluidLoader message={message || "Scanning Archive"} subMessage={subMessage} />
);

export const RhythmicScanner: React.FC<{ label?: string }> = ({ label }) => (
  <ModernFluidLoader message={label || "Processing"} subMessage="Reviewing details..." />
);


/**
 * Skeleton loaders keep the physical shape layouts beautifully intact while files load.
 */
export const SkeletonCard: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6 bg-slate-50/50 border border-slate-100 rounded-apple-xl animate-pulse h-full select-none">
      {/* Geometric frame */}
      <div className="w-10 h-10 bg-slate-100/80 rounded-apple flex items-center justify-center border border-slate-200/40" />
      
      {/* Text lines */}
      <div className="w-4/5 space-y-2 mt-2">
        <div className="h-2 bg-slate-200 rounded-full mx-auto" />
        <div className="w-3/5 h-1.5 bg-slate-100 rounded-full mx-auto" />
      </div>
    </div>
  );
};

export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div id="skeleton-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 md:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <React.Fragment key={i}>
          <SkeletonCard />
        </React.Fragment>
      ))}
    </div>
  );
};
