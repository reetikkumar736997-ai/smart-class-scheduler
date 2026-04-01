import { NextResponse } from "next/server";
import { signUp } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim() as "TEACHER" | "STUDENT";
  const department = String(formData.get("department") ?? "").trim();
  const classSectionId = String(formData.get("classSectionId") ?? "").trim();
  const rollNumber = String(formData.get("rollNumber") ?? "").trim();

  if (!name || !email || !password || !role) {
    return NextResponse.redirect(new URL("/signup?error=Please+fill+all+required+fields", request.url));
  }

  const session = await signUp({
    name,
    email,
    password,
    role,
    department,
    classSectionId,
    rollNumber,
  });

  if (!session) {
    return NextResponse.redirect(new URL("/signup?error=Email+already+exists+or+signup+failed", request.url));
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
