import React, { useEffect, useState } from "react";
import { User, FileText, Mail, LogOut, Clock, ShieldCheck } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Submission } from "../types";

const ProfilePage = ({
  user,
  onLogout,
}: {
  user: any;
  onLogout: () => void;
}) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user?.email) return;
      try {
        const q = query(
          collection(db, "submissions"),
          where("submittedByEmail", "==", user.email),
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Submission,
        );
        setSubmissions(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [user]);

  return (
    <div className="max-w-[1000px] mx-auto p-4 md:p-8 space-y-12">
      <div className="bg-white border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-100 p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 rounded-none sm:rounded-none sm:rounded-apple-2xl shadow-sm">
        <div className="w-32 h-32 bg-emerald-50 flex items-center justify-center border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-emerald-100 overflow-hidden shrink-0 rounded-none sm:rounded-none sm:rounded-apple-xl shadow-emerald-sm">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt="User"
              className="w-full h-full object-cover transition-transform hover:scale-110"
              referrerPolicy="no-referrer"
            />
          ) : (
            <User size={64} className="text-emerald-400" />
          )}
        </div>
        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="section-subheading text-emerald-600">
            Verified Academic Member
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none text-slate-900">
            {user.displayName || "Student Member"}
          </h1>
          <p className="card-label">{user.email}</p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-8">
            <button
              onClick={onLogout}
              className="flex items-center gap-3 text-slate-400 font-black uppercase text-[10px] tracking-[0.3em] hover:text-emerald-600 transition-all group px-8 py-3.5 bg-slate-50 rounded-none sm:rounded-apple hover:bg-emerald-50"
            >
              <LogOut
                size={16}
                className="group-hover:-translate-x-1 transition-transform"
              />{" "}
              Logout Session
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <h2 className="section-heading text-2xl">My Contributions</h2>
          <div className="h-0.5 flex-1 bg-slate-100" />
        </div>

        {loading ? (
          <div className="flex items-center gap-4 py-8 px-4">
            <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full animate-ping"></div>
            <p className="card-label">Scanning activity nodes...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="bg-slate-50 p-12 text-center rounded-none sm:rounded-none sm:rounded-apple-xl border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-100">
            <p className="card-label">No uploads recorded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="bg-white p-6 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-100 rounded-none sm:rounded-none sm:rounded-apple-xl flex flex-col md:flex-row md:items-center gap-8 hover:bg-emerald-50/50 transition-all hover:shadow-md group"
              >
                <div className="p-4 bg-white border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-100 text-emerald-600 rounded-none sm:rounded-apple shadow-emerald-sm transition-transform group-hover:scale-110">
                  <FileText size={24} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="card-label text-slate-300">
                    Ref: {sub.id.slice(0, 6).toUpperCase()}
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 group-hover:text-emerald-600 transition-colors">
                    {sub.title}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {sub.courseName} // {sub.subjectName}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span
                    className={`text-[9px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-full ${sub.status === "APPROVED" ? "bg-emerald-600 text-white shadow-emerald-sm" : "bg-slate-100 text-slate-400"}`}
                  >
                    {sub.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
