export type ProfileRole = 'teacher' | 'student';

export interface Profile {
  id: string;
  role: ProfileRole;
  full_name: string;
}

export interface ClassRecord {
  id: string;
  teacher_id: string;
  class_name: string;
  date: string;
}

export interface Topic {
  id: string;
  class_id: string;
  subject: string;
  topic_name: string;
}

export interface AttendanceRecord {
  id: string;
  class_id: string;
  student_id: string;
  status: 'present' | 'absent';
}

export interface AssessmentQuestion {
  topic_id: string;
  question_text: string;
  options: string[];
  correct_option: number;
}

export interface AssessmentDetail {
  id: string;
  assessment_id: string;
  topic_id: string;
  score: number;
  recommendation_urls: string[];
}

export interface Assessment {
  id: string;
  student_id: string;
  date: string;
  total_score: number;
  strengths: string[];
  weaknesses: string[];
}
