import { CalendarRange, Trash2 } from "lucide-react";
import {
  createManualTimetableEntryAction,
  deleteTimetableEntryAction,
} from "@/app/actions";
import { requireSession } from "@/lib/auth";
import {
  getClassSections,
  getSubjects,
  getTimeSlots,
  getTimetableForSection,
  getTimetableForTeacher,
  getUserById,
} from "@/lib/db-data";
import type { ClassSection, DayKey, Subject, TimetableEntry } from "@/lib/types";

const days: DayKey[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

const dayLabel: Record<DayKey, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
};

type SchedulePageProps = {
  searchParams?: Promise<{ error?: string; success?: string }>;
};

export default async function SchedulePage({ searchParams }: SchedulePageProps) {
  const session = await requireSession();
  const params = (await searchParams) ?? {};
  const timeSlots = getTimeSlots();
  const [subjects, classSections] = await Promise.all([getSubjects(), getClassSections()]);
  const scheduleEntries =
    session.role === "TEACHER"
      ? await getTimetableForTeacher(session.id)
      : await getTimetableForSection(session.classSectionId ?? classSections[0]?.id ?? "");
  const teacherIds = [...new Set<string>(scheduleEntries.map((entry: TimetableEntry) => entry.teacherId))];
  const teacherPairs = await Promise.all(
    teacherIds.map(async (teacherId: string) => [teacherId, await getUserById(teacherId)] as const),
  );
  const teacherMap = new Map(teacherPairs);
  const filledPeriods = scheduleEntries.length;
  const freePeriods = Math.max(days.length * timeSlots.length - filledPeriods, 0);

  return (
    <div className="space-y-6">
      <section className="panel rounded-[32px] border p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex rounded-full bg-[rgba(42,157,143,0.12)] p-3 text-[var(--accent)]">
              <CalendarRange className="h-5 w-5" />
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Simple timetable manager</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ink-soft)]">
              {session.role === "TEACHER"
                ? "Teachers can directly set classes, subjects, teacher names, and timetable periods. Students only see the final timetable."
                : "View the final class timetable exactly as set by the teacher."}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-white/85 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--ink-soft)]">Role</p>
              <p className="mt-2 text-2xl font-semibold">{session.role}</p>
            </div>
            <div className="rounded-3xl bg-white/85 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--ink-soft)]">
                {session.role === "TEACHER" ? "Teacher name" : "Your class"}
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {session.role === "TEACHER"
                  ? session.name
                  : (() => {
                      const section = classSections.find((item: ClassSection) => item.id === session.classSectionId);
                      return section ? `${section.className}-${section.section}` : "-";
                    })()}
              </p>
            </div>
            <div className="rounded-3xl bg-white/85 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--ink-soft)]">Visible periods</p>
              <p className="mt-2 text-2xl font-semibold">{scheduleEntries.length}</p>
            </div>
          </div>
        </div>

        {params.error ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{params.error}</p> : null}
        {params.success ? (
          <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{params.success}</p>
        ) : null}
      </section>

      {session.role === "TEACHER" ? (
        <section className="panel rounded-[32px] border p-6">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Manual timetable entry</h3>
            <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
              Use one form to enter the teacher name, class, section, room, subject, day, and period.
            </p>
          </div>

          <form action={createManualTimetableEntryAction} className="mt-5 grid gap-4 xl:grid-cols-8">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Teacher name</label>
              <input name="teacherName" defaultValue={session.name} className="input" placeholder="Teacher name" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Class</label>
              <input name="className" className="input" placeholder="10" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Section</label>
              <input name="section" className="input" placeholder="A" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Room</label>
              <input name="roomLabel" className="input" placeholder="Room 204" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Subject name</label>
              <input name="subjectName" className="input" placeholder="Mathematics" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Subject code</label>
              <input name="subjectCode" className="input" placeholder="MTH101" required />
            </div>
            <div className="xl:col-span-1">
              <label className="mb-2 block text-sm font-medium text-slate-700">Day</label>
              <select name="day" className="select" required>
                <option value="">Select day</option>
                {days.map((day) => (
                  <option key={day} value={day}>
                    {dayLabel[day]}
                  </option>
                ))}
              </select>
            </div>
            <div className="xl:col-span-1">
              <label className="mb-2 block text-sm font-medium text-slate-700">Period</label>
              <select name="slotOrder" className="select" required>
                <option value="">Select period</option>
                {timeSlots.map((slot) => (
                  <option key={slot.id} value={slot.order}>
                    {slot.label} ({slot.startTime}-{slot.endTime})
                  </option>
                ))}
              </select>
            </div>
            <div className="xl:col-span-8 flex flex-wrap items-center gap-3">
              <button type="submit" className="btn btn-primary w-full sm:w-auto">
                Add timetable entry
              </button>
              <div className="schedule-mini-stats">
                <span className="badge badge-accent">{filledPeriods} filled</span>
                <span className="badge badge-warm">{freePeriods} free</span>
              </div>
            </div>
          </form>
        </section>
      ) : null}

      <section className="panel overflow-hidden rounded-[32px] border">
        <div className="schedule-strip">
          {days.map((day) => {
            const count = scheduleEntries.filter((entry: TimetableEntry) => entry.day === day).length;
            return (
              <div key={day} className="schedule-strip-card">
                <p className="schedule-strip-label">{dayLabel[day]}</p>
                <p className="schedule-strip-value">{count}</p>
                <p className="schedule-strip-meta">{count === 1 ? "class" : "classes"}</p>
              </div>
            );
          })}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse schedule-table">
            <thead>
              <tr className="bg-white/80">
                <th className="schedule-sticky-col px-4 py-4 text-left text-sm font-semibold text-slate-900">Day</th>
                {timeSlots.map((slot) => (
                  <th key={slot.id} className="min-w-[220px] px-4 py-4 text-left text-sm font-semibold text-slate-900">
                    <div>{slot.label}</div>
                    <div className="mt-1 text-xs font-normal text-[var(--ink-soft)]">
                      {slot.startTime} - {slot.endTime}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day} className="border-t border-[var(--line)]">
                  <td className="schedule-sticky-col bg-white/65 px-4 py-5 text-sm font-semibold text-slate-900">
                    {dayLabel[day]}
                  </td>
                  {timeSlots.map((slot) => {
                    const entry = scheduleEntries.find(
                      (item: TimetableEntry) => item.day === day && item.slotOrder === slot.order,
                    );
                    const subject = subjects.find((item: Subject) => item.id === entry?.subjectId);
                    const teacher = entry ? teacherMap.get(entry.teacherId) : undefined;
                    const section = classSections.find((item: ClassSection) => item.id === entry?.classSectionId);

                    return (
                      <td key={`${day}-${slot.id}`} className="border-l border-[var(--line)] px-4 py-4 align-top">
                        {entry ? (
                          <div className="rounded-3xl bg-white/90 p-4 shadow-sm">
                            <p className="font-semibold text-slate-900">{subject?.name}</p>
                            <p className="mt-1 text-sm text-[var(--ink-soft)]">
                              Teacher: {entry.teacherName || teacher?.name}
                            </p>
                            <p className="mt-1 text-sm text-[var(--ink-soft)]">
                              Class: {section?.className}-{section?.section}
                            </p>
                            <p className="mt-1 text-sm text-[var(--ink-soft)]">Room: {entry.room}</p>

                            {session.role === "TEACHER" ? (
                              <form action={deleteTimetableEntryAction} className="mt-4">
                                <input type="hidden" name="entryId" value={entry.id} />
                                <button type="submit" className="btn btn-secondary w-full">
                                  <Trash2 className="h-4 w-4" />
                                  Remove
                                </button>
                              </form>
                            ) : null}
                          </div>
                        ) : (
                          <div className="rounded-3xl border border-dashed border-[var(--line)] bg-[rgba(255,255,255,0.38)] px-4 py-8 text-center text-sm text-[var(--ink-soft)]">
                            Free slot
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
