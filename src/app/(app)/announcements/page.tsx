import { Megaphone } from "lucide-react";
import {
  createAnnouncementAction,
  deleteAnnouncementAction,
  updateAnnouncementAction,
} from "@/app/actions";
import { requireSession } from "@/lib/auth";
import { getAnnouncements, getUserById } from "@/lib/db-data";
import type { Announcement, UserRecord } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type AnnouncementsPageProps = {
  searchParams?: Promise<{ error?: string; success?: string }>;
};

export default async function AnnouncementsPage({ searchParams }: AnnouncementsPageProps) {
  const session = await requireSession();
  const announcements = await getAnnouncements();
  const authorIds = [...new Set<string>(announcements.map((announcement: Announcement) => announcement.authorId))];
  const authorPairs = await Promise.all(
    authorIds.map(async (authorId: string) => [authorId, await getUserById(authorId)] as const),
  );
  const authorMap = new Map(authorPairs);
  const params = (await searchParams) ?? {};
  const announcementCards = announcements.map((announcement: Announcement) => ({
    announcement,
    author: authorMap.get(announcement.authorId),
  }));

  return (
    <div className="space-y-6">
      <section className="panel rounded-[32px] border p-6">
        <div className="mb-4 inline-flex rounded-full bg-[rgba(239,125,87,0.12)] p-3 text-[var(--brand)]">
          <Megaphone className="h-5 w-5" />
        </div>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Announcements panel</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
          Teachers can post, edit, and remove notices. Students can review the latest academic updates.
        </p>

        {params.error ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{params.error}</p> : null}
        {params.success ? (
          <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{params.success}</p>
        ) : null}
      </section>

      {session.role === "TEACHER" ? (
        <section className="panel rounded-[32px] border p-6">
          <h3 className="text-xl font-semibold text-slate-900">Post a new notice</h3>
          <form action={createAnnouncementAction} className="mt-5 grid gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Announcement title</label>
              <input className="input" name="title" placeholder="Write the notice title here" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Notice details</label>
              <textarea className="textarea min-h-28" name="body" placeholder="Write the full announcement details here" />
            </div>
            <div>
              <button className="btn btn-primary" type="submit">
                Publish notice
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="grid gap-4">
        {announcementCards.map(({ announcement, author }: { announcement: Announcement; author?: UserRecord }) => (
          <article key={announcement.id} className="panel rounded-[32px] border p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-sm font-medium text-[var(--ink-soft)]">{author?.name ?? "Teacher"}</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-900">{announcement.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{announcement.body}</p>
                  <p className="mt-4 text-xs text-[var(--ink-soft)]">Updated {formatDate(announcement.updatedAt)}</p>
                </div>

                {session.role === "TEACHER" ? (
                  <div className="w-full max-w-md space-y-3">
                    <form action={updateAnnouncementAction} className="grid gap-3 rounded-3xl bg-white/80 p-4">
                      <input type="hidden" name="id" value={announcement.id} />
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Edit title</label>
                        <input className="input" name="title" defaultValue={announcement.title} />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Edit details</label>
                        <textarea className="textarea min-h-24" name="body" defaultValue={announcement.body} />
                      </div>
                      <button className="btn btn-secondary" type="submit">
                        Update
                      </button>
                    </form>

                    <form action={deleteAnnouncementAction}>
                      <input type="hidden" name="id" value={announcement.id} />
                      <button className="btn btn-secondary w-full" type="submit">
                        Delete
                      </button>
                    </form>
                  </div>
                ) : null}
              </div>
            </article>
        ))}
      </section>
    </div>
  );
}
