import { GraduationCap, Users } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { getClassSections, getStudentUsers, getSubjects, getTeacherUsers } from "@/lib/db-data";
import type { ClassSection, Subject, UserRecord } from "@/lib/types";

export default async function PeoplePage() {
  await requireSession();
  const [teachers, students, subjects, sections] = await Promise.all([
    getTeacherUsers(),
    getStudentUsers(),
    getSubjects(),
    getClassSections(),
  ]);

  return (
    <div className="space-y-6">
      <section className="panel rounded-[32px] border p-6">
        <div className="mb-4 inline-flex rounded-full bg-[rgba(239,125,87,0.12)] p-3 text-[var(--brand)]">
          <Users className="h-5 w-5" />
        </div>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Teacher and student directory</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
          Simple people overview for the two-role version of the system.
        </p>
      </section>

      <section className="card-grid lg:grid-cols-2">
        <div className="panel rounded-[32px] border p-6">
          <div className="mb-4 flex items-center gap-3">
            <GraduationCap className="h-5 w-5 text-[var(--brand)]" />
            <h3 className="text-xl font-semibold text-slate-900">Teachers</h3>
          </div>
          <div className="grid gap-3">
            {teachers.map((teacher: UserRecord) => (
              <div key={teacher.id} className="rounded-3xl bg-white/80 p-4">
                <p className="font-semibold text-slate-900">{teacher.name}</p>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">{teacher.teacherProfile?.department}</p>
                <p className="mt-3 text-sm text-[var(--ink-soft)]">
                  Subjects:{" "}
                  {teacher.teacherProfile?.subjectIds
                    .map((subjectId: string) => subjects.find((subject: Subject) => subject.id === subjectId)?.name)
                    .join(", ")}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel rounded-[32px] border p-6">
          <div className="mb-4 flex items-center gap-3">
            <Users className="h-5 w-5 text-[var(--accent)]" />
            <h3 className="text-xl font-semibold text-slate-900">Students</h3>
          </div>
          <div className="grid gap-3">
            {students.map((student: UserRecord) => {
              const section = sections.find((item: ClassSection) => item.id === student.studentProfile?.classSectionId);
              return (
                <div key={student.id} className="rounded-3xl bg-white/80 p-4">
                  <p className="font-semibold text-slate-900">{student.name}</p>
                  <p className="mt-1 text-sm text-[var(--ink-soft)]">{student.studentProfile?.rollNumber}</p>
                  <p className="mt-3 text-sm text-[var(--ink-soft)]">
                    Section: {section?.className}-{section?.section}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
