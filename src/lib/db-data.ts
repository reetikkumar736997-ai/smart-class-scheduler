import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  Announcement,
  ClassSection,
  DayKey,
  StudyMaterial,
  Subject,
  TeacherAvailability,
  TimeSlot,
  TimetableEntry,
  UserRecord,
} from "@/lib/types";

type CreateUserInput = {
  name: string;
  email: string;
  passwordHash: string;
  role: "TEACHER" | "STUDENT";
  department?: string;
  classSectionId?: string;
  rollNumber?: string;
};

type CreateClassSectionInput = {
  className: string;
  section: string;
  roomLabel: string;
};

type CreateSubjectInput = {
  name: string;
  code: string;
  weeklyPeriods: number;
  teacherId: string;
};

const days: DayKey[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

const timeSlots: TimeSlot[] = [
  { id: "slot-1", label: "Period 1", startTime: "08:30", endTime: "09:15", order: 1 },
  { id: "slot-2", label: "Period 2", startTime: "09:20", endTime: "10:05", order: 2 },
  { id: "slot-3", label: "Period 3", startTime: "10:20", endTime: "11:05", order: 3 },
  { id: "slot-4", label: "Period 4", startTime: "11:10", endTime: "11:55", order: 4 },
  { id: "slot-5", label: "Period 5", startTime: "12:20", endTime: "13:05", order: 5 },
];

const demoDates = {
  oneDayAgo: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  twoDaysAgo: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  threeDaysAgo: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  fourDaysAgo: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
};

let seedPromise: Promise<void> | null = null;
type TransactionClient = Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$use" | "$extends">;

function serializeDate(value: Date) {
  return value.toISOString();
}

function mapUser(user: {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "TEACHER" | "STUDENT";
  teacherProfile:
    | {
        id: string;
        department: string;
        subjects: Array<{ id: string }>;
      }
    | null;
  studentProfile:
    | {
        id: string;
        classSectionId: string;
        rollNumber: string;
      }
    | null;
}): UserRecord {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    passwordHash: user.passwordHash,
    role: user.role,
    teacherProfile: user.teacherProfile
      ? {
          id: user.teacherProfile.id,
          department: user.teacherProfile.department,
          subjectIds: user.teacherProfile.subjects.map((subject: { id: string }) => subject.id),
        }
      : undefined,
    studentProfile: user.studentProfile
      ? {
          id: user.studentProfile.id,
          classSectionId: user.studentProfile.classSectionId,
          rollNumber: user.studentProfile.rollNumber,
        }
      : undefined,
  };
}

function mapClassSection(section: { id: string; className: string; section: string; roomLabel: string }): ClassSection {
  return {
    id: section.id,
    className: section.className,
    section: section.section,
    roomLabel: section.roomLabel,
  };
}

function mapSubject(subject: { id: string; name: string; code: string; weeklyPeriods: number; teacherId: string }): Subject {
  return {
    id: subject.id,
    name: subject.name,
    code: subject.code,
    weeklyPeriods: subject.weeklyPeriods,
    teacherId: subject.teacherId,
  };
}

function mapTimetableEntry(entry: {
  id: string;
  classSectionId: string;
  subjectId: string;
  teacherId: string;
  teacherName: string | null;
  day: DayKey;
  slotOrder: number;
  room: string | null;
}): TimetableEntry {
  return {
    id: entry.id,
    classSectionId: entry.classSectionId,
    subjectId: entry.subjectId,
    teacherId: entry.teacherId,
    teacherName: entry.teacherName ?? undefined,
    day: entry.day,
    slotOrder: entry.slotOrder,
    room: entry.room ?? "",
  };
}

function mapAnnouncement(announcement: {
  id: string;
  title: string;
  body: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}): Announcement {
  return {
    id: announcement.id,
    title: announcement.title,
    body: announcement.body,
    authorId: announcement.authorId,
    createdAt: serializeDate(announcement.createdAt),
    updatedAt: serializeDate(announcement.updatedAt),
  };
}

function mapMaterial(material: {
  id: string;
  title: string;
  subjectId: string;
  fileUrl: string;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}): StudyMaterial {
  return {
    id: material.id,
    title: material.title,
    subjectId: material.subjectId,
    fileUrl: material.fileUrl,
    uploadedBy: material.uploadedBy,
    createdAt: serializeDate(material.createdAt),
    updatedAt: serializeDate(material.updatedAt),
  };
}

async function ensureSeedData() {
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    return;
  }

  const teacherPasswordHash = await bcrypt.hash("teacher123", 10);
  const studentPasswordHash = await bcrypt.hash("student123", 10);

  await prisma.$transaction(async (tx: TransactionClient) => {
    await tx.classSection.createMany({
      data: [
        { id: "class-10a", className: "10", section: "A", roomLabel: "Room 204" },
        { id: "class-9b", className: "9", section: "B", roomLabel: "Room 108" },
      ],
    });
    
    await tx.user.create({
      data: {
        id: "teacher-alka",
        name: "Alka Sharma",
        email: "teacher@smartclass.edu",
        passwordHash: teacherPasswordHash,
        role: "TEACHER",
        teacherProfile: {
          create: {
            id: "profile-alka",
            department: "Science",
          },
        },
      },
    });

    await tx.user.create({
      data: {
        id: "teacher-rahul",
        name: "Rahul Verma",
        email: "teacher2@smartclass.edu",
        passwordHash: teacherPasswordHash,
        role: "TEACHER",
        teacherProfile: {
          create: {
            id: "profile-rahul",
            department: "Humanities",
          },
        },
      },
    });

    await tx.user.create({
      data: {
        id: "student-ananya",
        name: "Ananya Singh",
        email: "student@smartclass.edu",
        passwordHash: studentPasswordHash,
        role: "STUDENT",
        studentProfile: {
          create: {
            id: "student-profile-ananya",
            classSectionId: "class-10a",
            rollNumber: "10A-17",
          },
        },
      },
    });

    await tx.user.create({
      data: {
        id: "student-aman",
        name: "Aman Khan",
        email: "student2@smartclass.edu",
        passwordHash: studentPasswordHash,
        role: "STUDENT",
        studentProfile: {
          create: {
            id: "student-profile-aman",
            classSectionId: "class-9b",
            rollNumber: "9B-08",
          },
        },
      },
    });

    await tx.subject.createMany({
      data: [
        { id: "maths", name: "Mathematics", code: "MTH101", weeklyPeriods: 5, teacherId: "teacher-alka" },
        { id: "physics", name: "Physics", code: "PHY101", weeklyPeriods: 4, teacherId: "teacher-alka" },
        { id: "english", name: "English", code: "ENG101", weeklyPeriods: 4, teacherId: "teacher-rahul" },
        { id: "history", name: "History", code: "HIS101", weeklyPeriods: 3, teacherId: "teacher-rahul" },
      ],
    });

    const availabilityRows: Array<{ teacherId: string; day: DayKey; slotOrder: number; available: boolean }> = [];
    for (const teacherId of ["teacher-alka", "teacher-rahul"]) {
      for (const day of days) {
        for (const slot of timeSlots) {
          availabilityRows.push({
            teacherId,
            day,
            slotOrder: slot.order,
            available: !(teacherId === "teacher-rahul" && day === "WEDNESDAY" && slot.order >= 4),
          });
        }
      }
    }

    await tx.teacherAvailability.createMany({ data: availabilityRows });
    
    await tx.announcement.createMany({
      data: [
        {
          id: "ann-1",
          title: "Unit test preparation",
          body: "Mathematics revision worksheet has been uploaded. Solve it before Friday.",
          authorId: "teacher-alka",
          createdAt: demoDates.oneDayAgo,
          updatedAt: demoDates.oneDayAgo,
        },
        {
          id: "ann-2",
          title: "Debate club notice",
          body: "English debate selections will happen after period 5 on Thursday.",
          authorId: "teacher-rahul",
          createdAt: demoDates.twoDaysAgo,
          updatedAt: demoDates.twoDaysAgo,
        },
      ],
    });

    await tx.studyMaterial.createMany({
      data: [
        {
          id: "mat-1",
          title: "Quadratic equations notes",
          subjectId: "maths",
          fileUrl: "/sample-materials/quadratic-equations.pdf",
          uploadedBy: "teacher-alka",
          createdAt: demoDates.threeDaysAgo,
          updatedAt: demoDates.threeDaysAgo,
        },
        {
          id: "mat-2",
          title: "Poetry analysis guide",
          subjectId: "english",
          fileUrl: "/sample-materials/poetry-analysis.pdf",
          uploadedBy: "teacher-rahul",
          createdAt: demoDates.fourDaysAgo,
          updatedAt: demoDates.fourDaysAgo,
        },
      ],
    });

    await tx.timetableEntry.createMany({
      data: [
        {
          id: "entry-demo-1",
          classSectionId: "class-10a",
          subjectId: "maths",
          teacherId: "teacher-alka",
          teacherName: "Alka Sharma",
          day: "MONDAY",
          slotOrder: 1,
          room: "Room 204",
        },
        {
          id: "entry-demo-2",
          classSectionId: "class-9b",
          subjectId: "english",
          teacherId: "teacher-rahul",
          teacherName: "Rahul Verma",
          day: "TUESDAY",
          slotOrder: 2,
          room: "Room 108",
        },
      ],
    });
  });
}

async function ensureReady() {
  if (!seedPromise) {
    seedPromise = ensureSeedData();
  }

  await seedPromise;
}

export function getTimeSlots() {
  return timeSlots;
}

export async function getTeacherUsers() {
  await ensureReady();
  const users = await prisma.user.findMany({
    where: { role: "TEACHER" },
    orderBy: { name: "asc" },
    include: {
      teacherProfile: {
        include: {
          subjects: true,
        },
      },
      studentProfile: true,
    },
  });

  return users.map(mapUser);
}

export async function getStudentUsers() {
  await ensureReady();
  const users = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { name: "asc" },
    include: {
      teacherProfile: {
        include: {
          subjects: true,
        },
      },
      studentProfile: true,
    },
  });

  return users.map(mapUser);
}

export async function getUserByEmail(email: string) {
  await ensureReady();
  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
    },
    include: {
      teacherProfile: {
        include: {
          subjects: true,
        },
      },
      studentProfile: true,
    },
  });

  return user ? mapUser(user) : undefined;
}

export async function getUserById(id: string) {
  await ensureReady();
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      teacherProfile: {
        include: {
          subjects: true,
        },
      },
      studentProfile: true,
    },
  });

  return user ? mapUser(user) : undefined;
}

export async function getSubjects() {
  await ensureReady();
  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
  });

  return subjects.map(mapSubject);
}

export async function getSubjectsForTeacher(teacherId: string) {
  await ensureReady();
  const subjects = await prisma.subject.findMany({
    where: { teacherId },
    orderBy: { name: "asc" },
  });

  return subjects.map(mapSubject);
}

export async function getClassSections() {
  await ensureReady();
  const sections = await prisma.classSection.findMany({
    orderBy: [{ className: "asc" }, { section: "asc" }],
  });

  return sections.map(mapClassSection);
}

export async function createClassSection(input: CreateClassSectionInput) {
  await ensureReady();
  const className = input.className.trim();
  const section = input.section.trim().toUpperCase();

  const exists = await prisma.classSection.findFirst({
    where: {
      className: {
        equals: className,
        mode: "insensitive",
      },
      section: {
        equals: section,
        mode: "insensitive",
      },
    },
  });

  if (exists) {
    return { ok: false, message: "This class section already exists." as const };
  }

  await prisma.classSection.create({
    data: {
      className,
      section,
      roomLabel: input.roomLabel.trim() || `Room ${200 + (await prisma.classSection.count())}`,
    },
  });

  return { ok: true as const };
}

export async function createUser(input: CreateUserInput) {
  await ensureReady();
  const existing = await getUserByEmail(input.email);
  if (existing) {
    return { ok: false, message: "Email already exists." as const };
  }

  if (input.role === "STUDENT" && !input.classSectionId) {
    const firstSection = await prisma.classSection.findFirst({
      orderBy: [{ className: "asc" }, { section: "asc" }],
    });
    input.classSectionId = firstSection?.id;
  }

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash: input.passwordHash,
      role: input.role,
      teacherProfile:
        input.role === "TEACHER"
          ? {
              create: {
                department: input.department?.trim() || "General",
              },
            }
          : undefined,
      studentProfile:
        input.role === "STUDENT" && input.classSectionId
          ? {
              create: {
                classSectionId: input.classSectionId,
                rollNumber: input.rollNumber?.trim() || `NEW-${Date.now()}`,
              },
            }
          : undefined,
    },
    include: {
      teacherProfile: {
        include: {
          subjects: true,
        },
      },
      studentProfile: true,
    },
  });

  if (input.role === "TEACHER") {
    const availabilityRows = days.flatMap((day) =>
      timeSlots.map((slot: TimeSlot) => ({
        teacherId: user.id,
        day,
        slotOrder: slot.order,
        available: true,
      })),
    );
    await prisma.teacherAvailability.createMany({ data: availabilityRows });
  }

  return { ok: true as const, user: mapUser(user) };
}

export async function createSubject(input: CreateSubjectInput) {
  await ensureReady();
  const name = input.name.trim();
  const code = input.code.trim().toUpperCase();
  const weeklyPeriods = Math.max(1, input.weeklyPeriods);

  if (!name || !code) {
    return { ok: false, message: "Subject name and code are required." as const };
  }

  const existing = await prisma.subject.findUnique({
    where: { code },
  });
  if (existing) {
    return { ok: false, message: "Subject code already exists." as const };
  }

  await prisma.subject.create({
    data: {
      name,
      code,
      weeklyPeriods,
      teacherId: input.teacherId,
    },
  });

  return { ok: true as const };
}

export async function getAnnouncements() {
  await ensureReady();
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
  });

  return announcements.map(mapAnnouncement);
}

export async function createAnnouncement(authorId: string, title: string, body: string) {
  await ensureReady();
  await prisma.announcement.create({
    data: {
      title,
      body,
      authorId,
    },
  });
}

export async function updateAnnouncement(id: string, title: string, body: string) {
  await ensureReady();
  await prisma.announcement.update({
    where: { id },
    data: {
      title,
      body,
    },
  });
}

export async function deleteAnnouncement(id: string) {
  await ensureReady();
  await prisma.announcement.delete({
    where: { id },
  });
}

export async function getMaterials() {
  await ensureReady();
  const materials = await prisma.studyMaterial.findMany({
    orderBy: { createdAt: "desc" },
  });

  return materials.map(mapMaterial);
}

export async function addMaterial(title: string, subjectId: string, fileUrl: string, uploadedBy: string) {
  await ensureReady();
  await prisma.studyMaterial.create({
    data: {
      title,
      subjectId,
      fileUrl,
      uploadedBy,
    },
  });
}

export async function getMaterialById(id: string) {
  await ensureReady();
  const material = await prisma.studyMaterial.findUnique({
    where: { id },
  });

  return material ? mapMaterial(material) : undefined;
}

export async function updateMaterial(id: string, title: string, subjectId: string) {
  await ensureReady();
  await prisma.studyMaterial.update({
    where: { id },
    data: {
      title,
      subjectId,
    },
  });
}

export async function deleteMaterial(id: string) {
  await ensureReady();
  await prisma.studyMaterial.delete({
    where: { id },
  });
}

export async function getAvailabilityForTeacher(teacherId: string) {
  await ensureReady();
  const availability = await prisma.teacherAvailability.findMany({
    where: { teacherId },
    orderBy: [{ day: "asc" }, { slotOrder: "asc" }],
  });

  return availability.map(
    (entry: { teacherId: string; day: DayKey; slotOrder: number; available: boolean }): TeacherAvailability => ({
      teacherId: entry.teacherId,
      day: entry.day,
      slotOrder: entry.slotOrder,
      available: entry.available,
    }),
  );
}

export async function toggleTeacherAvailability(teacherId: string, day: DayKey, slotOrder: number) {
  await ensureReady();
  const record = await prisma.teacherAvailability.findUnique({
    where: {
      teacherId_day_slotOrder: {
        teacherId,
        day,
        slotOrder,
      },
    },
  });

  if (record) {
    await prisma.teacherAvailability.update({
      where: { id: record.id },
      data: {
        available: !record.available,
      },
    });
  }
}

export async function getTimetableForSection(classSectionId: string) {
  await ensureReady();
  const entries = await prisma.timetableEntry.findMany({
    where: { classSectionId },
    orderBy: [{ day: "asc" }, { slotOrder: "asc" }],
  });

  return entries.map(mapTimetableEntry);
}

export async function getTimetableForTeacher(teacherId: string) {
  await ensureReady();
  const entries = await prisma.timetableEntry.findMany({
    where: { teacherId },
    orderBy: [{ day: "asc" }, { slotOrder: "asc" }],
  });

  return entries.map(mapTimetableEntry);
}

export async function createManualTimetableEntry(input: {
  classSectionId: string;
  subjectId: string;
  teacherId: string;
  teacherName: string;
  day: DayKey;
  slotOrder: number;
}) {
  await ensureReady();
  const [section, subject] = await Promise.all([
    prisma.classSection.findUnique({ where: { id: input.classSectionId } }),
    prisma.subject.findUnique({ where: { id: input.subjectId } }),
  ]);
  const teacherName = input.teacherName.trim();

  if (!section || !subject) {
    return { ok: false, message: "Class section or subject not found." as const };
  }

  if (subject.teacherId !== input.teacherId) {
    return { ok: false, message: "You can only assign your own subjects." as const };
  }

  if (!teacherName) {
    return { ok: false, message: "Teacher name is required." as const };
  }

  const teacherBusy = await prisma.timetableEntry.findFirst({
    where: {
      teacherName: {
        equals: teacherName,
        mode: "insensitive",
      },
      day: input.day,
      slotOrder: input.slotOrder,
    },
  });

  if (teacherBusy) {
    return { ok: false, message: "This teacher already has another class in this slot." as const };
  }

  const classBusy = await prisma.timetableEntry.findFirst({
    where: {
      classSectionId: input.classSectionId,
      day: input.day,
      slotOrder: input.slotOrder,
    },
  });

  if (classBusy) {
    return { ok: false, message: "This class already has a subject in that slot." as const };
  }

  await prisma.timetableEntry.create({
    data: {
      classSectionId: input.classSectionId,
      subjectId: input.subjectId,
      teacherId: input.teacherId,
      teacherName,
      day: input.day,
      slotOrder: input.slotOrder,
      room: section.roomLabel,
    },
  });

  return { ok: true as const };
}

export async function deleteTimetableEntry(entryId: string, teacherId: string) {
  await ensureReady();
  const entry = await prisma.timetableEntry.findFirst({
    where: {
      id: entryId,
      teacherId,
    },
  });

  if (!entry) {
    return { ok: false, message: "Timetable entry not found." as const };
  }

  await prisma.timetableEntry.delete({
    where: { id: entryId },
  });

  return { ok: true as const };
}
