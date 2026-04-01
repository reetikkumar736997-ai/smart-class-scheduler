export type Role = "TEACHER" | "STUDENT";

export type DayKey =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  classSectionId?: string;
};

export type TimeSlot = {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  order: number;
};

export type TeacherProfile = {
  id: string;
  department: string;
  subjectIds: string[];
};

export type StudentProfile = {
  id: string;
  classSectionId: string;
  rollNumber: string;
};

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  teacherProfile?: TeacherProfile;
  studentProfile?: StudentProfile;
};

export type ClassSection = {
  id: string;
  className: string;
  section: string;
  roomLabel: string;
};

export type Subject = {
  id: string;
  name: string;
  code: string;
  weeklyPeriods: number;
  teacherId: string;
};

export type TeacherAvailability = {
  teacherId: string;
  day: DayKey;
  slotOrder: number;
  available: boolean;
};

export type TimetableEntry = {
  id: string;
  classSectionId: string;
  subjectId: string;
  teacherId: string;
  teacherName?: string;
  day: DayKey;
  slotOrder: number;
  room: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
};

export type StudyMaterial = {
  id: string;
  title: string;
  subjectId: string;
  fileUrl: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type ScheduleConflict = {
  subjectId: string;
  teacherId: string;
  reason: string;
  alternateSlotOrders: Array<{ day: DayKey; slotOrder: number }>;
};

export type GenerationReport = {
  classSectionId: string;
  generatedAt: string;
  conflicts: ScheduleConflict[];
};
