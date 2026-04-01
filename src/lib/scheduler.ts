import { DayKey, GenerationReport, ScheduleConflict, TimetableEntry } from "@/lib/types";

type SchedulerStore = {
  classSections: Array<{ id: string; roomLabel: string }>;
  subjects: Array<{ id: string; weeklyPeriods: number; teacherId: string }>;
  availability: Array<{ teacherId: string; day: DayKey; slotOrder: number; available: boolean }>;
  timetable: TimetableEntry[];
  timeSlots: Array<{ order: number }>;
};

const days: DayKey[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

function getAvailableAlternates(
  store: SchedulerStore,
  classSectionId: string,
  teacherId: string,
  localEntries: TimetableEntry[],
) {
  return days.flatMap((day) =>
    store.timeSlots
      .filter((slot) => {
        const teacherAvailable = store.availability.find(
          (entry) => entry.teacherId === teacherId && entry.day === day && entry.slotOrder === slot.order,
        )?.available;

        const teacherBusy = [...store.timetable, ...localEntries].some(
          (entry) => entry.teacherId === teacherId && entry.day === day && entry.slotOrder === slot.order,
        );

        const classBusy = [...store.timetable, ...localEntries].some(
          (entry) => entry.classSectionId === classSectionId && entry.day === day && entry.slotOrder === slot.order,
        );

        return teacherAvailable && !teacherBusy && !classBusy;
      })
      .map((slot) => ({ day, slotOrder: slot.order })),
  );
}

export function generateScheduleForSection(classSectionId: string, store: SchedulerStore) {
  const classSection = store.classSections.find((entry) => entry.id === classSectionId);
  if (!classSection) {
    return {
      entries: [],
      report: {
        classSectionId,
        generatedAt: new Date().toISOString(),
        conflicts: [],
      } satisfies GenerationReport,
    };
  }

  const localEntries: TimetableEntry[] = [];
  const conflicts: ScheduleConflict[] = [];
  const subjectQueue = [...store.subjects].sort((a, b) => b.weeklyPeriods - a.weeklyPeriods);

  for (const subject of subjectQueue) {
    let placed = 0;

    for (const day of days) {
      for (const slot of store.timeSlots) {
        if (placed >= subject.weeklyPeriods) {
          break;
        }

        const teacherAvailable = store.availability.find(
          (entry) => entry.teacherId === subject.teacherId && entry.day === day && entry.slotOrder === slot.order,
        )?.available;

        const teacherBusy = [...store.timetable, ...localEntries].some(
          (entry) => entry.teacherId === subject.teacherId && entry.day === day && entry.slotOrder === slot.order,
        );

        const classBusy = [...store.timetable, ...localEntries].some(
          (entry) => entry.classSectionId === classSectionId && entry.day === day && entry.slotOrder === slot.order,
        );

        if (!teacherAvailable || teacherBusy || classBusy) {
          continue;
        }

        localEntries.push({
          id: `${classSectionId}-${subject.id}-${day}-${slot.order}`,
          classSectionId,
          subjectId: subject.id,
          teacherId: subject.teacherId,
          day,
          slotOrder: slot.order,
          room: classSection.roomLabel,
        });
        placed += 1;
      }
    }

    if (placed < subject.weeklyPeriods) {
      conflicts.push({
        subjectId: subject.id,
        teacherId: subject.teacherId,
        reason: `Only ${placed} of ${subject.weeklyPeriods} periods could be assigned.`,
        alternateSlotOrders: getAvailableAlternates(store, classSectionId, subject.teacherId, localEntries).slice(0, 5),
      });
    }
  }

  return {
    entries: localEntries,
    report: {
      classSectionId,
      generatedAt: new Date().toISOString(),
      conflicts,
    } satisfies GenerationReport,
  };
}
