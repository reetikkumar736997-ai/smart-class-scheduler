import ChatbotClient from "./chatbot-client";
import { requireSession } from "@/lib/auth";
import { getClassSections, getSubjects, getSubjectsForTeacher } from "@/lib/db-data";
import type { ClassSection, Subject } from "@/lib/types";

export default async function ChatbotPage() {
  const session = await requireSession();
  const [classSections, subjects, teacherSubjects] = await Promise.all([
    getClassSections(),
    getSubjects(),
    session.role === "TEACHER" ? getSubjectsForTeacher(session.id) : Promise.resolve([]),
  ]);
  const classSection = session.classSectionId
    ? classSections.find((item: ClassSection) => item.id === session.classSectionId)
    : null;
  const teacherSubjectNames =
    session.role === "TEACHER" ? teacherSubjects.map((item: Subject) => item.name).join(", ") : "";
  const classSubjects =
    session.role === "STUDENT" && session.classSectionId
      ? subjects
          .slice(0, 6)
          .map((item: Subject) => item.name)
          .join(", ")
      : "";

  const contextSummary =
    session.role === "TEACHER"
      ? `Teacher context: ${teacherSubjectNames || "No subjects added yet"}`
      : `Student context: ${classSection ? `${classSection.className}-${classSection.section}` : "Class not set"} | ${classSubjects || "General study support"}`;

  return <ChatbotClient roleLabel={session.role.toLowerCase()} contextSummary={contextSummary} />;
}
