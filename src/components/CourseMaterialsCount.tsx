import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Files } from 'lucide-react';

interface CourseMaterialsCountProps {
  courseId: string;
}

export default function CourseMaterialsCount({ courseId }: CourseMaterialsCountProps) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    // 1. Get real-time subjects matching this courseId
    const subjectsQuery = query(
      collection(db, 'subjects'),
      where('courseId', '==', courseId)
    );

    const unsubscribeSubjects = onSnapshot(
      subjectsQuery,
      (subjectsSnapshot) => {
        const subjectIds = subjectsSnapshot.docs.map((doc) => doc.id);

        if (subjectIds.length === 0) {
          setCount(0);
          return;
        }

        // 2. Query in-real-time for materials belonging to these subjects
        // Firestore 'in' matches up to 30 items
        const targetSubjectIds = subjectIds.slice(0, 30);
        const materialsQuery = query(
          collection(db, 'materials'),
          where('subjectId', 'in', targetSubjectIds)
        );

        const unsubscribeMaterials = onSnapshot(
          materialsQuery,
          (materialsSnapshot) => {
            // Count total matching materials
            setCount(materialsSnapshot.size);
          },
          (error) => {
            console.error(`Firebase materials count failed for course ${courseId}:`, error);
          }
        );

        return () => {
          unsubscribeMaterials();
        };
      },
      (error) => {
        console.error(`Firebase subjects fetch failed for course ${courseId}:`, error);
      }
    );

    return () => {
      unsubscribeSubjects();
    };
  }, [courseId]);

  if (count === null) {
    return (
      <div className="mt-3 flex items-center justify-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-apple text-[9px] font-black uppercase tracking-widest text-slate-400 animate-pulse">
        <span>Counting...</span>
      </div>
    );
  }

  return (
    <div 
      className={`mt-3 flex items-center justify-center gap-1.5 px-3 py-1 border rounded-apple text-[9px] font-black uppercase tracking-widest transition-all ${
        count > 0 
          ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700' 
          : 'bg-slate-50 border-slate-100 text-slate-400'
      }`}
    >
      <Files size={10} className={count > 0 ? 'text-emerald-600' : 'text-slate-400'} />
      <span>{count} {count === 1 ? 'material' : 'materials'}</span>
    </div>
  );
}
