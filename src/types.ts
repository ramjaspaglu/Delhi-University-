export interface Course {
  id: string;
  name: string;
  description: string;
  level: 'UG' | 'PG';
  durationYears: number;
  nepBased: boolean;
}

export interface Subject {
  id: string;
  courseId: string;
  semester: number;
  name: string;
  code: string;
  description?: string;
}

export interface Material {
  id: string;
  subjectId: string;
  title: string;
  url: string;
  type: 'PDF' | 'VIDEO' | 'LINK' | 'NOTES';
  author?: string;
  submittedBy?: string;
  submittedAt?: string;
  isApproved: boolean;
  tags?: string[];
  upvotes?: number;
  downvotes?: number;
  flags?: number;
  clicks?: number;
  downloads?: number;
  impressions?: number;
}

export interface Submission {
  id: string;
  submissionType: 'MATERIAL' | 'SUBJECT_PROPOSAL';
  title: string;
  url?: string;
  type?: string;
  courseName: string;
  subjectName: string;
  semester: number;
  submittedByEmail: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  description?: string;
}

export interface College {
  id?: string;
  name: string;
  campus: string; // North Campus, South Campus, Off-Campus
  established: number;
  address: string;
  imageUrl?: string;
  description: string;
  courseNames: string[];
}
