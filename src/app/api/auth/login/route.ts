import { NextResponse } from "next/server";
import { signIn } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim() as "TEACHER" | "STUDENT";
  const session = await signIn(email, password, role);

  if (!session) {
    return NextResponse.redirect(new URL("/login?error=Invalid+email,+password,+or+role", request.url));
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
