import { cookies } from "next/headers";
import { SessionUser } from "@/lib/types";

export const SESSION_COOKIE = "smart_scheduler_session";

export async function readSessionCookie() {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value;
}

export function encodeSession(session: SessionUser) {
  return Buffer.from(JSON.stringify(session)).toString("base64url");
}

export function decodeSession(value?: string) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    return parsed as SessionUser;
  } catch {
    return null;
  }
}
