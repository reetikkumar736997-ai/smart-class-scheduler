import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getClassSections } from "@/lib/db-data";
import type { ClassSection } from "@/lib/types";

type SignupPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  const params = (await searchParams) ?? {};
  const classSections = await getClassSections();

  return (
    <main className="shell flex items-center justify-center">
      <section className="panel mx-auto w-full max-w-3xl rounded-[32px] border p-8 animate-rise">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[rgba(42,157,143,0.12)] p-3 text-[var(--accent)]">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--ink-soft)]">Signup</p>
              <h1 className="text-3xl font-semibold text-slate-900">Create teacher or student account</h1>
            </div>
          </div>

          <Link href="/login" className="btn btn-secondary">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>

        <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
          There are only two available roles: teacher and student. Sign in later using the same role you choose during signup.
        </p>

        {params.error ? (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{params.error}</p>
        ) : null}

        <form action="/api/auth/signup" method="post" className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Signup as</label>
            <select className="select" name="role" defaultValue="STUDENT">
              <option value="TEACHER">Teacher</option>
              <option value="STUDENT">Student</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
            <input className="input" name="name" placeholder="Enter your full name" required />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input className="input" name="email" type="email" placeholder="your@email.com" required />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <input className="input" name="password" type="password" placeholder="Create a password" required />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Department (teacher only)</label>
            <input className="input" name="department" placeholder="Science / Commerce / Arts" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Class section (student only)</label>
            <select className="select" name="classSectionId" defaultValue={classSections[0]?.id}>
              {classSections.map((section: ClassSection) => (
                <option key={section.id} value={section.id}>
                  {section.className}-{section.section}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Roll number (student only)</label>
            <input className="input" name="rollNumber" placeholder="10A-21" />
          </div>

          <div className="md:col-span-2">
            <button className="btn btn-primary w-full" type="submit">
              Create account
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
