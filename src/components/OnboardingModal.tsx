import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  ShieldCheck,
  User,
  Landmark,
  BookOpen,
  Hash,
  Phone,
  LogOut,
  CheckCircle,
} from "lucide-react";
import { User as FirebaseUser } from "firebase/auth";

const DU_COLLEGES = [
  "Ramjas College",
  "Hindu College",
  "Hansraj College",
  "Kirori Mal College",
  "St. Stephen's College",
  "Miranda House",
  "Sri Venkateswara College",
  "Lady Shri Ram College",
  "Shri Ram College of Commerce",
  "Delhi College of Arts and Commerce",
  "Shaheed Sukhdev College of Business Studies",
  "Atma Ram Sanatan Dharma College",
  "Dyal Singh College",
  "Gargi College",
  "Jesus and Mary College",
  "SGTB Khalsa College",
  "Indraprastha College for Women",
  "Motilal Nehru College",
  "Rajdhani College",
  "Other",
];

interface OnboardingModalProps {
  user: FirebaseUser;
  isOpen: boolean;
  onSave: (data: {
    fullName: string;
    collegeName: string;
    department: string;
    rollNumber: string;
    phoneNumber: string;
    hasConsented: boolean;
  }) => Promise<void>;
  onSkip?: () => Promise<void>;
  onLogout: () => void;
}

export default function OnboardingModal({
  user,
  isOpen,
  onSave,
  onSkip,
  onLogout,
}: OnboardingModalProps) {
  const [fullName, setFullName] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [customCollege, setCustomCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [hasConsented, setHasConsented] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user?.displayName) {
      setFullName(user.displayName);
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const finalCollege =
      collegeName === "Other" ? customCollege.trim() : collegeName;

    if (!fullName.trim()) {
      setErrorMsg("Full Academic Name is required.");
      return;
    }
    if (!finalCollege || !finalCollege.trim()) {
      setErrorMsg("Please specify your affiliated Delhi University college.");
      return;
    }
    if (!department.trim()) {
      setErrorMsg("Please enter your study department or course name.");
      return;
    }
    if (!rollNumber.trim()) {
      setErrorMsg("Your student Roll Number / Scholar ID is mandatory.");
      return;
    }
    if (!phoneNumber.trim()) {
      setErrorMsg("Contact number is required for verification alerts.");
      return;
    }
    if (!hasConsented) {
      setErrorMsg("You must consent to the privacy policy rules to proceed.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        fullName: fullName.trim(),
        collegeName: finalCollege,
        department: department.trim(),
        rollNumber: rollNumber.trim(),
        phoneNumber: phoneNumber.trim(),
        hasConsented,
      });
    } catch (err: any) {
      setErrorMsg(
        err.message || "Failed to submit academic registration profile.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md overflow-y-auto p-4 md:p-6"
      id="onboarding-overlay"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-lg md:max-w-2xl border-y border-x-0 sm:border sm:border-x border-slate-100 shadow-2xl rounded-none sm:rounded-none sm:rounded-apple-2xl overflow-hidden my-auto flex flex-col"
        id="onboarding-container"
      >
        {/* Banner with header */}
        <div className="bg-slate-50 border-b border-slate-100 p-6 sm:p-8 md:px-12 md:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase text-emerald-600 tracking-[0.3em] flex items-center gap-1.5 matches-text animate-pulse">
              <ShieldCheck size={12} /> Profile Setup (Optional)
            </span>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-slate-900 break-words hyphens-auto">
              Customize Academic Profile
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded transition-all cursor-pointer text-[10px] font-black uppercase tracking-wider"
              >
                Skip / Setup Later
              </button>
            )}
            <button
              onClick={onLogout}
              title="Log out and cancel"
              className="p-2.5 text-slate-400 hover:text-slate-900 bg-white border-y border-x-0 sm:border sm:border-x border-slate-200 hover:border-slate-800 transition-all rounded-none sm:rounded-apple cursor-pointer text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5"
            >
              <LogOut size={13} /> Exit
            </button>
          </div>
        </div>

        {/* Informative covenant note */}
        <div className="px-6 py-4 sm:px-8 md:px-12 bg-emerald-50/45 border-b border-emerald-100 text-slate-605">
          <p className="text-[10px] font-semibold uppercase tracking-tight leading-relaxed break-words hyphens-auto">
            <strong className="text-emerald-800">Academic Verification:</strong>{" "}
            This archive enables optional college verification variables. If
            skipped, we only fetch your name and email using your Google
            sign-in. Your custom profile fields can be set up now or left empty.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 md:p-12 space-y-6 overflow-y-auto max-h-[75vh]"
        >
          {errorMsg && (
            <div className="p-4 bg-red-50 border-y border-x-0 sm:border sm:border-x border-red-200 text-red-600 text-[10px] font-black uppercase tracking-wider rounded">
              Error Validation: {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <User size={12} className="text-slate-300" /> Full Academic Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="eg. Aryan Sharma"
                className="w-full px-4 py-3 bg-slate-50 focus:bg-white border-y border-x-0 sm:border sm:border-x focus:border-emerald-600 rounded-none sm:rounded-apple outline-none text-[11px] font-bold text-slate-800 transition-all uppercase placeholder-slate-300"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Phone size={12} className="text-slate-300" /> WhatsApp /
                Contact No.
              </label>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="eg. +91 9876543210"
                className="w-full px-4 py-3 bg-slate-50 focus:bg-white border-y border-x-0 sm:border sm:border-x focus:border-emerald-600 rounded-none sm:rounded-apple outline-none text-[11px] font-bold text-slate-800 transition-all uppercase placeholder-slate-300"
              />
            </div>

            {/* University College Dropdown */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Landmark size={12} className="text-slate-300" /> Affiliated DU
                College
              </label>
              <select
                required
                value={collegeName}
                onChange={(e) => {
                  setCollegeName(e.target.value);
                  if (e.target.value !== "Other") setCustomCollege("");
                }}
                className="w-full px-4 py-3 bg-slate-50 focus:bg-white border-y border-x-0 sm:border sm:border-x focus:border-emerald-600 rounded-none sm:rounded-apple outline-none text-[11px] font-bold text-slate-800 transition-all uppercase text-left"
              >
                <option value="">-- Choose College --</option>
                {DU_COLLEGES.map((clg) => (
                  <option key={clg} value={clg}>
                    {clg}
                  </option>
                ))}
              </select>
            </div>

            {/* Roll Number */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Hash size={12} className="text-slate-300" /> Student Roll No. /
                ID
              </label>
              <input
                type="text"
                required
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="eg. 22/CS/1025"
                className="w-full px-4 py-3 bg-slate-50 focus:bg-white border-y border-x-0 sm:border sm:border-x focus:border-emerald-600 rounded-none sm:rounded-apple outline-none text-[11px] font-bold text-slate-800 transition-all uppercase placeholder-slate-300"
              />
            </div>
          </div>

          {/* Custom College Input if 'Other' chosen */}
          {collegeName === "Other" && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Specify College Name
              </label>
              <input
                type="text"
                required
                value={customCollege}
                onChange={(e) => setCustomCollege(e.target.value)}
                placeholder="eg. Deshbandhu College, DU"
                className="w-full px-4 py-3 bg-slate-50 focus:bg-white border-y border-x-0 sm:border sm:border-x focus:border-emerald-600 rounded-none sm:rounded-apple outline-none text-[11px] font-bold text-slate-800 transition-all uppercase placeholder-slate-300"
              />
            </motion.div>
          )}

          {/* Department Study Node */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <BookOpen size={12} className="text-slate-300" /> Course
              Department / Subject Area
            </label>
            <input
              type="text"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="eg. B.Sc. (Hons) Computer Science, Semester IV"
              className="w-full px-4 py-3 bg-slate-50 focus:bg-white border-y border-x-0 sm:border sm:border-x focus:border-emerald-600 rounded-none sm:rounded-apple outline-none text-[11px] font-bold text-slate-800 transition-all uppercase placeholder-slate-300"
            />
          </div>

          {/* Strict Privacy Agreement summary panel */}
          <div className="p-5 border-y border-x-0 sm:border sm:border-x border-slate-100 rounded bg-slate-50 uppercase tracking-tight text-[10px] text-slate-500 font-medium space-y-3">
            <p className="font-extrabold text-slate-800">
              Covenant Policy Statement:
            </p>
            <p className="leading-relaxed regular-text">
              By ticking below, you acknowledge that DU Archive processes your
              workspace variables (Name, Affiliation College, Department Course,
              WhatsApp verification and ID) inside authenticated Google Cloud
              structures. We guarantee total safety and absolute prevention of
              external monetization trackers. Details are utilized only for
              student validation.
            </p>
          </div>

          {/* Consent Checkbox */}
          <label className="flex gap-3 items-start select-none cursor-pointer group p-2 border-y border-x-0 sm:border sm:border-x border-slate-100 bg-white rounded-none sm:rounded-apple">
            <input
              type="checkbox"
              required
              checked={hasConsented}
              onChange={(e) => setHasConsented(e.target.checked)}
              className="mt-1 transition-all accent-emerald-600 text-white rounded cursor-pointer w-4 h-4"
            />
            <span className="text-[9.5px] font-extrabold text-slate-600 uppercase tracking-tight leading-relaxed group-hover:text-slate-900 transition-all">
              I agree to the Secure Privacy Policy and Academic Terms of Use. I
              authorize storing my affiliation data securely.
            </span>
          </label>

          {/* Submit Action */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="flex-1 py-5 border-y border-x-0 sm:border sm:border-x border-slate-250 hover:bg-slate-50 text-slate-700 text-[10px] font-black uppercase tracking-[0.25em] transition-all rounded-none sm:rounded-apple flex items-center justify-center gap-2 cursor-pointer"
              >
                Skip Setup (Google Account Only)
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !hasConsented}
              className="flex-1 py-5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-[0.4em] transition-all rounded-none sm:rounded-apple disabled:opacity-50 flex items-center justify-center gap-2.5 cursor-pointer shadow-emerald-sm"
            >
              {isSubmitting ? (
                <>Saving Academic Node...</>
              ) : (
                <>
                  <CheckCircle size={14} /> Submit Profile Verification Record
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
