import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, ExternalLink, Copy, Check, Loader2, FileText, RefreshCw, Eye, AlertTriangle, Download } from 'lucide-react';
import { Material } from '../types';
import { AcademicDocLoader } from './Loader';
import { ReportIssueModal } from './ReportIssueModal';

interface PdfPreviewModalProps {
  material: Material;
  onClose: () => void;
  onTrackDownload?: (materialId: string) => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({ material, onClose, onTrackDownload }) => {
  const [copied, setCopied] = useState(false);
  const [useGoogleViewer, setUseGoogleViewer] = useState(true);
  const [loading, setLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Transform standard URLs to highly embeddable counterparts
  const getEmbeddableUrl = (url: string, forceGview: boolean): string => {
    if (!url) return '';

    // Convert standard Google Drive link to its preview counterpart
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
      return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    }

    if (forceGview) {
      // Use Google Docs Document Viewer for reliable remote pdf parsing
      return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
    }

    return url;
  };

  const activeUrl = getEmbeddableUrl(material.url, useGoogleViewer);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(material.url).then(() => {
      setCopied(true);
      if (onTrackDownload) {
        onTrackDownload(material.id);
      }
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div 
      id="pdf-preview-backdrop" 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
    >
      <motion.div
        id="pdf-preview-dialog"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-5xl h-[85vh] bg-white rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-slate-200"
      >
        {/* Header bar of the viewer */}
        <div id="pdf-preview-header" className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <FileText size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
                LOBAL NODE // PREVIEWING {material.type}
              </span>
              <h3 className="text-sm font-bold text-slate-800 line-clamp-1 max-w-[300px] sm:max-w-[450px]">
                {material.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle viewing modes */}
            <button
              onClick={() => {
                setLoading(true);
                setUseGoogleViewer(!useGoogleViewer);
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-all"
              title={useGoogleViewer ? "Switch to Direct Embed Embed" : "Switch to Google document viewer"}
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">
                {useGoogleViewer ? "Direct View" : "Doc Viewer"}
              </span>
            </button>

            {/* Copy resource link */}
            <button
               onClick={handleCopyLink}
               className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
               title="Copy link to clipboard"
            >
              {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
            </button>

            {/* Download PDF button */}
            <a
              href={material.url}
              download
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                if (onTrackDownload) {
                  onTrackDownload(material.id);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-900 hover:bg-emerald-600 hover:border-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
              title="Download this PDF directly"
            >
              <Download size={14} />
              <span>Download PDF</span>
            </a>

            {/* Open link in outer browser */}
            <a
              href={material.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                if (onTrackDownload) {
                  onTrackDownload(material.id);
                }
              }}
              className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
              title="Open raw document in new tab"
            >
              <ExternalLink size={16} />
            </a>

            {/* Close modal */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              aria-label="Close Preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Info panel explaining embedded preview limits */}
        <div id="pdf-preview-hint" className="bg-emerald-50/50 border-b border-emerald-100/40 px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-600">
          <div className="flex items-center gap-2">
            <Eye size={12} className="text-emerald-650" />
            <span>Currently displaying: <strong>{useGoogleViewer ? "Google Document View" : "Native Frame"}</strong>.</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-450">If document is not loading, we are fixing this issue. We actively work on it.</span>
            <button
              onClick={() => setReportOpen(true)}
              className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white hover:bg-slate-800 rounded transition-colors"
            >
              Report Broken Doc
            </button>
          </div>
        </div>

        {/* Content Viewer pane */}
        <div id="pdf-preview-body" className="flex-1 bg-slate-100 relative min-h-0">
          {loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
              <AcademicDocLoader message="Retrieving Node Material" subMessage="Embedding document viewer frame..." />
              <div className="mt-4 p-4 border border-slate-200 bg-white rounded-lg max-w-sm">
                <p className="text-[10px] font-black uppercase text-slate-800 tracking-wider">Trouble loading this document?</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                  If this page hangs, please be assured we are fixing this issue. We work on it. Try switching views above or click the button below.
                </p>
                <button
                  onClick={() => setReportOpen(true)}
                  className="mt-3 px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 text-[9px] font-black uppercase tracking-wider rounded transition-colors"
                >
                  Report Loading Failure
                </button>
              </div>
            </div>
          )}
          
          <iframe
            key={`${material.id}-${useGoogleViewer}`}
            src={activeUrl}
            className="w-full h-full border-0"
            title={`Preview of ${material.title}`}
            onLoad={() => setLoading(false)}
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        </div>

        {/* The Actionable Report Issue Dialog */}
        <ReportIssueModal
          isOpen={reportOpen}
          onClose={() => setReportOpen(false)}
          defaultTargetUrl={material.url}
          defaultMaterialTitle={material.title}
          defaultReportedPage="PDF Document Previewer"
        />
      </motion.div>
    </div>
  );
};
