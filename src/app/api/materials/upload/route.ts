import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { addMaterial } from "@/lib/db-data";
import { uploadToSupabaseStorage } from "@/lib/supabase";

export async function POST(request: Request) {
  const session = await requireSession("TEACHER");
  const formData = await request.formData();
  const title = String(formData.get("title") ?? "").trim();
  const subjectId = String(formData.get("subjectId") ?? "").trim();
  const file = formData.get("file");

  if (!title || !subjectId || !(file instanceof File) || file.size === 0) {
    return NextResponse.redirect(new URL("/materials?error=Please+fill+all+material+fields", request.url));
  }

  const safeName = file.name.toLowerCase();
  if (!safeName.endsWith(".pdf")) {
    return NextResponse.redirect(new URL("/materials?error=Only+PDF+files+are+allowed", request.url));
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}-${safeName.replace(/[^a-z0-9.-]/g, "-")}`;
  const fileUrl = await uploadToSupabaseStorage(fileName, buffer, file.type || "application/pdf");

  await addMaterial(title, subjectId, fileUrl, session.id);
  return NextResponse.redirect(new URL("/materials?success=Material+uploaded", request.url));
}
