import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createUser, getUserByEmail } from "@/lib/db-data";
import { decodeSession, encodeSession, readSessionCookie, SESSION_COOKIE } from "@/lib/session";
import { Role, SessionUser } from "@/lib/types";

export async function getSession() {
  const value = await readSessionCookie();
  return decodeSession(value);
}

export async function requireSession(role?: Role) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (role && session.role !== role) {
    redirect("/dashboard");
  }

  return session;
}

export async function signIn(email: string, password: string, role?: Role) {
  const user = await getUserByEmail(email);
  if (!user) {
    return null;
  }

  if (role && user.role !== role) {
    return null;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return null;
  }

  const session: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    classSectionId: user.studentProfile?.classSectionId,
  };

  const store = await cookies();
  store.set(SESSION_COOKIE, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return session;
}

export async function signOut() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function signUp(input: {
  name: string;
  email: string;
  password: string;
  role: Role;
  department?: string;
  classSectionId?: string;
  rollNumber?: string;
}) {
  const created = await createUser({
    name: input.name,
    email: input.email,
    passwordHash: await bcrypt.hash(input.password, 10),
    role: input.role,
    department: input.department,
    classSectionId: input.classSectionId,
    rollNumber: input.rollNumber,
  });

  if (!created.ok) {
    return null;
  }

  return signIn(input.email, input.password, input.role);
}
