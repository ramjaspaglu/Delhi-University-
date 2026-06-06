import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, AlertTriangle, CheckCircle } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTargetUrl?: string;
  defaultMaterialTitle?: string;
  defaultReportedPage?: string;
}

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  isOpen,
  onClose,
  defaultTargetUrl = '',
  defaultMaterialTitle = '',
  defaultReportedPage = 'Main Platform Viewer',
}) => {
  const [targetUrl, setTargetUrl] = useState(defaultTargetUrl);
  const [materialTitle, setMaterialTitle] = useState(defaultMaterialTitle);
  const [reportedPage, setReportedPage] = useState(defaultReportedPage);
  const [userDescription, setUserDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userDescription.trim()) {
      setErrorMsg('Please specify what is not loading or broken.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const email = auth.currentUser?.email || 'anonymous';
      const pathForWrite = 'reports';

      const payload = {
        reportedPage,
        status: 'PENDING',
        userDescription: userDescription.trim(),
        createdAt: new Date().toISOString(),
        reportedByEmail: email,
        targetUrl: targetUrl.trim(),
        materialTitle: materialTitle.trim(),
        adminNotes: '',
      };

      try {
        await addDoc(collection(db, pathForWrite), payload);
        setSuccessMsg(
          'We have logged your report. Our engineering officers are working on it and will resolve this loading issue immediately.'
        );
        setUserDescription('');
        setTimeout(() => {
          onClose();
          setSuccessMsg('');
        }, 3000);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, pathForWrite);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to log report: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="report-issue-modal-overlay"
          className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
        >
          <motion.div
            id="report-issue-modal-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Header with High-Contrast Solid Accent */}
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-wider text-white">
                  Report System Loading Issue
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Close dialog"
              >
                <X size={16} />
              </button>
            </div>

            {/* Support Message Banner */}
            <div className="bg-emerald-50 border-b border-emerald-100 p-4">
              <p className="text-[10px] font-bold text-slate-800 uppercase tracking-tight">
                NOTICE: SYSTEM FIXING ACTIVE
              </p>
              <p className="text-[11px] text-emerald-800 mt-1 leading-snug font-medium">
                If any study material, PDF files, or page contents fail to load properly, please be assured we are fixing this issue. We are actively working on it. Submit a report below to notify admin supervisors.
              </p>
            </div>

            <form onSubmit={handleSubmitReport} className="p-6 space-y-4">
              {/* Material Details (Read-only / Optional) */}
              {materialTitle && (
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-slate-400 tracking-wider block">
                    Failing Asset Target
                  </label>
                  <div className="bg-slate-50 border border-slate-200 rounded px-3 py-2 text-[10px] font-bold uppercase text-slate-700">
                    {materialTitle}
                  </div>
                </div>
              )}

              {/* Reported Page context */}
              <div className="space-y-1.5">
                <label className="text-[8px] font-black uppercase text-slate-400 tracking-wider block">
                  Location / Page Name
                </label>
                <input
                  type="text"
                  value={reportedPage}
                  onChange={(e) => setReportedPage(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-slate-800 px-3 py-2 text-xs font-bold uppercase text-slate-900 rounded outline-none"
                  placeholder="e.g. DU Syllabus Tracker, Calendar Portal"
                  required
                />
              </div>

              {/* Failing URL */}
              <div className="space-y-1.5">
                <label className="text-[8px] font-black uppercase text-slate-400 tracking-wider block">
                  Document / Asset URL (Optional)
                </label>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-slate-800 px-3 py-2 text-[11px] text-slate-600 rounded outline-none font-mono"
                  placeholder="e.g. http://web.du.ac.in/..."
                />
              </div>

              {/* User Description */}
              <div className="space-y-1.5">
                <label className="text-[8px] font-black uppercase text-slate-400 tracking-wider block">
                  What is not loading? (Describe the issue) *
                </label>
                <textarea
                  value={userDescription}
                  onChange={(e) => setUserDescription(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-slate-800 p-3 text-xs text-slate-700 rounded outline-none font-medium"
                  placeholder="Please describe what happens. (e.g. PDF viewer says file missing, page keeps loading blank, external links are broken)"
                  rows={3}
                  required
                />
              </div>

              {/* Error or Success feedback inside modal */}
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-100 text-[10px] uppercase tracking-wider font-bold text-red-800 text-center rounded">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-150 text-[10px] font-bold text-emerald-800 text-center rounded space-y-1">
                  <div className="flex items-center justify-center gap-1.5">
                    <CheckCircle size={12} className="text-emerald-700" />
                    <span>REPORT LOGGED</span>
                  </div>
                  <p className="text-[9px] font-medium leading-relaxed lowercase uppercase select-all">
                    {successMsg}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              {!successMsg && (
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-700 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 bg-slate-950 hover:bg-slate-900 disabled:opacity-40 text-[9px] font-black uppercase tracking-widest text-white rounded flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting ? (
                      'Logging Report...'
                    ) : (
                      <>
                        <Send size={10} />
                        <span>Submit Report</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
