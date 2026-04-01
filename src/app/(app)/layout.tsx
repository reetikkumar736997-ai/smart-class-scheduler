import Link from "next/link";
import { BookOpen, CalendarRange, LayoutDashboard, LogOut, Megaphone, MessageSquare, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { signOutAction } from "@/app/actions";
import { cn } from "@/lib/utils";
import LiveRefresh from "./live-refresh";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/schedule", label: "Schedule", icon: CalendarRange },
  { href: "/announcements", label: "Announcements", icon: Megaphone },
  { href: "/materials", label: "Materials", icon: BookOpen },
  { href: "/chatbot", label: "Chatbot", icon: MessageSquare },
  { href: "/people", label: "People", icon: Users },
];

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireSession();

  return (
    <div className="shell">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="panel rounded-[32px] border p-5">
          <div className="rounded-[28px] bg-[linear-gradient(135deg,rgba(239,125,87,0.94),rgba(216,90,43,0.86))] p-5 text-white">
            <p className="text-xs uppercase tracking-[0.28em] text-white/70">Smart Class</p>
            <h1 className="mt-3 text-2xl font-semibold">Scheduler Hub</h1>
            <p className="mt-2 text-sm text-white/80">
              Logged in as {session.name} ({session.role.toLowerCase()}).
            </p>
          </div>

          <nav className="mt-5 grid gap-2">
            {navItems.map((item: NavItem) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                  "hover:bg-white/70",
                )}
              >
                <item.icon className="h-4 w-4 text-[var(--brand)]" />
                {item.label}
              </Link>
            ))}
          </nav>

          <form action={signOutAction} className="mt-6">
            <button type="submit" className="btn btn-secondary w-full">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </form>
        </aside>

        <main className="space-y-6">{children}</main>
      </div>
      <LiveRefresh />
    </div>
  );
}
