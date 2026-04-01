import Link from "next/link";
import { ArrowRight, BookMarked, GraduationCap, Megaphone, Sparkles } from "lucide-react";
import { requireSession } from "@/lib/auth";
import {
  getAnnouncements,
  getClassSections,
  getMaterials,
  getSubjects,
  getTimetableForSection,
  getTimetableForTeacher,
  getTimeSlots,
} from "@/lib/db-data";
import type { Announcement, ClassSection, StudyMaterial, Subject, TimeSlot, TimetableEntry } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const dayNames = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
};

type NextClassCard = {
  entry: TimetableEntry;
  subject?: Subject;
  slot?: TimeSlot;
  section?: ClassSection;
};

export default async function DashboardPage() {
  const session = await requireSession();
  const [allAnnouncements, allMaterials, subjects, classSections] = await Promise.all([
    getAnnouncements(),
    getMaterials(),
    getSubjects(),
    getClassSections(),
  ]);
  const announcements = allAnnouncements.slice(0, 3);
  const materials = allMaterials.slice(0, 3);
  const timeSlots = getTimeSlots();

  const scheduleEntries =
    session.role === "TEACHER"
      ? await getTimetableForTeacher(session.id)
      : await getTimetableForSection(session.classSectionId ?? "");
  const teacherSubjects = subjects.filter((subject: Subject) => subject.teacherId === session.id);
  const orderedDayKeys = Object.keys(dayNames) as Array<keyof typeof dayNames>;

  const nextClasses: NextClassCard[] = scheduleEntries
    .slice()
    .sort((a: TimetableEntry, b: TimetableEntry) => {
      if (a.day === b.day) {
        return a.slotOrder - b.slotOrder;
      }

      return orderedDayKeys.indexOf(a.day) - orderedDayKeys.indexOf(b.day);
    })
    .slice(0, 4)
    .map((entry: TimetableEntry) => {
      const subject = subjects.find((item: Subject) => item.id === entry.subjectId);
      const slot = timeSlots.find((item: TimeSlot) => item.order === entry.slotOrder);
      const section = classSections.find((item: ClassSection) => item.id === entry.classSectionId);
      return { entry, subject, slot, section };
    });

  return (
    <div className="space-y-6">
      <section className="panel rounded-[32px] border p-6 animate-rise">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="badge badge-accent mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              Smart dashboard
            </span>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              Welcome back, {session.name.split(" ")[0]}.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
              {session.role === "TEACHER"
                ? "Manage classes, subjects, and the timetable directly. Students will see the final schedule, announcements, and study materials here."
                : "View your final timetable, latest announcements, PDFs, and study support from one screen."}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-white/85 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--ink-soft)]">Role</p>
              <p className="mt-2 text-2xl font-semibold">{session.role}</p>
            </div>
            <div className="rounded-3xl bg-white/85 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--ink-soft)]">Classes</p>
              <p className="mt-2 text-2xl font-semibold">{scheduleEntries.length}</p>
            </div>
            <div className="rounded-3xl bg-white/85 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--ink-soft)]">
                {session.role === "TEACHER" ? "Subjects" : "Section"}
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {session.role === "TEACHER"
                  ? teacherSubjects.length
                  : (() => {
                      const section = classSections.find((item: ClassSection) => item.id === session.classSectionId);
                      return section ? `${section.className}-${section.section}` : "-";
                    })()}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="card-grid lg:grid-cols-[1.3fr_1fr]">
        <div className="panel rounded-[30px] border p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--ink-soft)]">Upcoming schedule</p>
              <h3 className="text-2xl font-semibold text-slate-900">Weekly classes</h3>
            </div>
            <Link href="/schedule" className="btn btn-secondary">
              Open schedule
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-3">
            {nextClasses.map(({ entry, subject, slot, section }: NextClassCard) => (
              <div key={entry.id} className="rounded-3xl border border-white/60 bg-white/80 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge badge-warm">{dayNames[entry.day]}</span>
                  <span className="badge badge-accent">{slot?.label}</span>
                </div>
                <p className="mt-3 text-lg font-semibold text-slate-900">{subject?.name}</p>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">
                  {slot?.startTime} - {slot?.endTime}
                  {session.role === "TEACHER" ? ` • ${section?.className}-${section?.section}` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel rounded-[30px] border p-6">
            <div className="mb-4 flex items-center gap-3">
              <Megaphone className="h-5 w-5 text-[var(--brand)]" />
              <h3 className="text-xl font-semibold text-slate-900">Latest announcements</h3>
            </div>
            <div className="grid gap-3">
              {announcements.map((announcement: Announcement) => (
                <div key={announcement.id} className="rounded-3xl bg-white/80 p-4">
                  <p className="font-semibold text-slate-900">{announcement.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{announcement.body}</p>
                  <p className="mt-3 text-xs text-[var(--ink-soft)]">{formatDate(announcement.updatedAt)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel rounded-[30px] border p-6">
            <div className="mb-4 flex items-center gap-3">
              <BookMarked className="h-5 w-5 text-[var(--accent)]" />
              <h3 className="text-xl font-semibold text-slate-900">Quick materials</h3>
            </div>
            <div className="grid gap-3">
              {materials.map((material: StudyMaterial) => {
                const subject = subjects.find((item: Subject) => item.id === material.subjectId);
                return (
                  <a
                    key={material.id}
                    href={material.fileUrl}
                    className="rounded-3xl bg-white/80 p-4 transition hover:translate-y-[-1px]"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <p className="font-semibold text-slate-900">{material.title}</p>
                    <p className="mt-1 text-sm text-[var(--ink-soft)]">{subject?.name}</p>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="panel rounded-[30px] border p-6">
        <div className="mb-4 flex items-center gap-3">
          <GraduationCap className="h-5 w-5 text-[var(--accent)]" />
          <div>
            <p className="text-sm font-medium text-[var(--ink-soft)]">Study Assistant</p>
            <h3 className="text-xl font-semibold text-slate-900">Ask a quick concept question</h3>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            "Explain quadratic equations in simple words",
            "What are the main themes of a poem?",
            "Give me a short revision plan for physics",
          ].map((prompt: string) => (
            <Link
              key={prompt}
              href={`/chatbot?question=${encodeURIComponent(prompt)}`}
              className="rounded-3xl border border-white/60 bg-white/80 p-4 text-sm leading-6 text-slate-700"
            >
              {prompt}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
