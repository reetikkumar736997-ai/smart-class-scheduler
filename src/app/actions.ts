"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createAnnouncement,
  createClassSection,
  createManualTimetableEntry,
  createSubject,
  deleteAnnouncement,
  deleteMaterial,
  deleteTimetableEntry,
  getClassSections,
  getMaterialById,
  getSubjectsForTeacher,
  updateAnnouncement,
  updateMaterial,
} from "@/lib/db-data";
import { deleteFromSupabaseStorage, getSupabaseBucket } from "@/lib/supabase";
import { requireSession, signOut } from "@/lib/auth";
import type { ClassSection, DayKey, Subject } from "@/lib/types";

export async function createAnnouncementAction(formData: FormData) {
  const session = await requireSession("TEACHER");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title || !body) {
    redirect("/announcements?error=Please+fill+all+announcement+fields");
  }

  await createAnnouncement(session.id, title, body);
  revalidatePath("/dashboard");
  revalidatePath("/announcements");
  redirect("/announcements?success=Announcement+posted");
}

export async function updateAnnouncementAction(formData: FormData) {
  await requireSession("TEACHER");
  await updateAnnouncement(
    String(formData.get("id") ?? ""),
    String(formData.get("title") ?? "").trim(),
    String(formData.get("body") ?? "").trim(),
  );
  revalidatePath("/dashboard");
  revalidatePath("/announcements");
  redirect("/announcements?success=Announcement+updated");
}

export async function deleteAnnouncementAction(formData: FormData) {
  await requireSession("TEACHER");
  await deleteAnnouncement(String(formData.get("id") ?? ""));
  revalidatePath("/dashboard");
  revalidatePath("/announcements");
  redirect("/announcements?success=Announcement+deleted");
}

export async function updateMaterialAction(formData: FormData) {
  await requireSession("TEACHER");
  await updateMaterial(
    String(formData.get("id") ?? ""),
    String(formData.get("title") ?? "").trim(),
    String(formData.get("subjectId") ?? "").trim(),
  );
  revalidatePath("/dashboard");
  revalidatePath("/materials");
  redirect("/materials?success=Material+updated");
}

export async function deleteMaterialAction(formData: FormData) {
  await requireSession("TEACHER");
  const id = String(formData.get("id") ?? "");
  const material = await getMaterialById(id);
  await deleteMaterial(id);

  if (material) {
    const publicPrefix = `/storage/v1/object/public/${getSupabaseBucket()}/`;
    const markerIndex = material.fileUrl.indexOf(publicPrefix);
    if (markerIndex !== -1) {
      const objectPath = material.fileUrl.slice(markerIndex + publicPrefix.length);
      await deleteFromSupabaseStorage(objectPath);
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/materials");
  redirect("/materials?success=Material+deleted");
}

export async function createManualTimetableEntryAction(formData: FormData) {
  const session = await requireSession("TEACHER");
  let classSectionId = "";
  let subjectId = "";
  const teacherName = String(formData.get("teacherName") ?? "").trim();
  const day = String(formData.get("day") ?? "") as DayKey;
  const slotOrder = Number(formData.get("slotOrder") ?? 0);

  const className = String(formData.get("className") ?? "").trim();
  const section = String(formData.get("section") ?? "").trim();
  const roomLabel = String(formData.get("roomLabel") ?? "").trim();
  const subjectName = String(formData.get("subjectName") ?? "").trim();
  const subjectCode = String(formData.get("subjectCode") ?? "").trim();

  if (!classSectionId && className && section) {
    const existingSection = (await getClassSections()).find(
      (item: ClassSection) =>
        item.className.toLowerCase() === className.toLowerCase() &&
        item.section.toLowerCase() === section.toLowerCase(),
    );

    if (existingSection) {
      classSectionId = existingSection.id;
    } else {
      const createdSection = await createClassSection({ className, section, roomLabel });
      if (!createdSection.ok) {
        redirect(`/schedule?error=${encodeURIComponent(createdSection.message)}`);
      }

      const newSection = (await getClassSections()).find(
        (item: ClassSection) =>
          item.className.toLowerCase() === className.toLowerCase() &&
          item.section.toLowerCase() === section.toLowerCase(),
      );
      classSectionId = newSection?.id ?? "";
    }
  }

  if (!subjectId && subjectName && subjectCode) {
    const existingSubject = (await getSubjectsForTeacher(session.id)).find(
      (item: Subject) => item.code.toLowerCase() === subjectCode.toLowerCase(),
    );

    if (existingSubject) {
      subjectId = existingSubject.id;
    } else {
      const createdSubject = await createSubject({
        name: subjectName,
        code: subjectCode,
        weeklyPeriods: 1,
        teacherId: session.id,
      });
      if (!createdSubject.ok) {
        redirect(`/schedule?error=${encodeURIComponent(createdSubject.message)}`);
      }

      const newSubject = (await getSubjectsForTeacher(session.id)).find(
        (item: Subject) => item.code.toLowerCase() === subjectCode.toLowerCase(),
      );
      subjectId = newSubject?.id ?? "";
    }
  }

  if (!teacherName || !classSectionId || !subjectId || !day || !slotOrder) {
    redirect("/schedule?error=Please+fill+all+manual+timetable+fields");
  }

  const result = await createManualTimetableEntry({
    classSectionId,
    subjectId,
    teacherId: session.id,
    teacherName,
    day,
    slotOrder,
  });

  revalidatePath("/dashboard");
  revalidatePath("/schedule");
  if (!result.ok) {
    redirect(`/schedule?error=${encodeURIComponent(result.message)}`);
  }

  redirect("/schedule?success=Manual+timetable+entry+added");
}

export async function deleteTimetableEntryAction(formData: FormData) {
  const session = await requireSession("TEACHER");
  const entryId = String(formData.get("entryId") ?? "");
  const result = await deleteTimetableEntry(entryId, session.id);

  revalidatePath("/dashboard");
  revalidatePath("/schedule");
  if (!result.ok) {
    redirect(`/schedule?error=${encodeURIComponent(result.message)}`);
  }

  redirect("/schedule?success=Timetable+entry+deleted");
}

export async function createClassSectionAction(formData: FormData) {
  await requireSession("TEACHER");
  const result = await createClassSection({
    className: String(formData.get("className") ?? ""),
    section: String(formData.get("section") ?? ""),
    roomLabel: String(formData.get("roomLabel") ?? ""),
  });

  revalidatePath("/schedule");
  if (!result.ok) {
    redirect(`/schedule?error=${encodeURIComponent(result.message)}`);
  }

  redirect("/schedule?success=New+class+section+created");
}

export async function createSubjectAction(formData: FormData) {
  const session = await requireSession("TEACHER");
  const result = await createSubject({
    name: String(formData.get("name") ?? ""),
    code: String(formData.get("code") ?? ""),
    weeklyPeriods: 1,
    teacherId: session.id,
  });

  revalidatePath("/schedule");
  revalidatePath("/dashboard");
  if (!result.ok) {
    redirect(`/schedule?error=${encodeURIComponent(result.message)}`);
  }

  redirect("/schedule?success=New+subject+created");
}

export async function signOutAction() {
  await signOut();
  redirect("/login");
}
