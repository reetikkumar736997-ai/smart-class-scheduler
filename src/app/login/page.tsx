import Link from "next/link";
import { BookOpen, CalendarDays, LogIn, MessageSquareText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

type LoginPageProps = {
  searchParams?: Promise<{ error?: string; role?: string }>;
};

type LoginFeature = {
  icon: LucideIcon;
  title: string;
  text: string;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  const params = (await searchParams) ?? {};
  const selectedRole = params.role === "STUDENT" ? "STUDENT" : "TEACHER";

  return (
    <main className="shell flex items-center justify-center">
      <div className="hero-grid mx-auto w-full max-w-6xl animate-rise">
        <section className="panel rounded-[32px] border p-8">
          <span className="badge badge-accent mb-4">Two-role portal</span>
          <h1 className="max-w-sm text-4xl font-semibold tracking-tight text-slate-900">
            Smart Class Scheduler for teachers and students.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-[var(--ink-soft)]">
            Everything a teacher adds, including the timetable, announcements, and materials, becomes directly visible to students.
          </p>

          <div className="mt-8 grid gap-3">
            {[
              { icon: CalendarDays, title: "Simple timetable", text: "Teachers can directly set class periods and teacher names." },
              { icon: BookOpen, title: "Shared materials", text: "Teacher uploads appear instantly to students." },
              { icon: MessageSquareText, title: "Student support", text: "Students can use the study chatbot anytime." },
            ].map((item: LoginFeature) => (
              <div key={item.title} className="rounded-3xl border border-white/60 bg-white/70 p-4 shadow-sm">
                <item.icon className="mb-3 h-5 w-5 text-[var(--brand)]" />
                <h2 className="font-semibold text-slate-900">{item.title}</h2>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="panel rounded-[32px] border p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-[rgba(239,125,87,0.12)] p-3 text-[var(--brand)]">
              <LogIn className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--ink-soft)]">Login</p>
              <h2 className="text-2xl font-semibold text-slate-900">Sign in as teacher or student</h2>
            </div>
          </div>

          <form action="/api/auth/login" method="post" className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Login as</label>
              <select className="select" name="role" defaultValue={selectedRole}>
                <option value="TEACHER">Teacher Login</option>
                <option value="STUDENT">Student Login</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input name="email" type="email" className="input" placeholder="teacher@smartclass.edu" required />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <input name="password" type="password" className="input" placeholder="Enter your password" required />
            </div>

            {params.error ? (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{params.error}</p>
            ) : null}

            <button className="btn btn-primary w-full" type="submit">
              Login
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-[rgba(20,33,61,0.04)] p-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">No account yet?</p>
              <p className="text-sm text-[var(--ink-soft)]">Create a teacher or student account first.</p>
            </div>
            <Link href="/signup" className="btn btn-secondary">
              Go to signup
            </Link>
          </div>

          <div className="mt-6 grid gap-3 rounded-3xl bg-[rgba(20,33,61,0.04)] p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Demo accounts</p>
            <p>Teacher: teacher@smartclass.edu / teacher123</p>
            <p>Student: student@smartclass.edu / student123</p>
          </div>
        </section>
      </div>
    </main>
  );
}
