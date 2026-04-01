import { BookOpenText, Download } from "lucide-react";
import { deleteMaterialAction, updateMaterialAction } from "@/app/actions";
import { requireSession } from "@/lib/auth";
import { getMaterials, getSubjects, getUserById } from "@/lib/db-data";
import type { StudyMaterial, Subject, UserRecord } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type MaterialsPageProps = {
  searchParams?: Promise<{ error?: string; success?: string }>;
};

export default async function MaterialsPage({ searchParams }: MaterialsPageProps) {
  const session = await requireSession();
  const [materials, subjects] = await Promise.all([getMaterials(), getSubjects()]);
  const uploaderIds = [...new Set<string>(materials.map((material: StudyMaterial) => material.uploadedBy))];
  const uploaderPairs = await Promise.all(
    uploaderIds.map(async (uploaderId: string) => [uploaderId, await getUserById(uploaderId)] as const),
  );
  const uploaderMap = new Map(uploaderPairs);
  const params = (await searchParams) ?? {};
  const materialCards = materials.map((material: StudyMaterial) => ({
    material,
    subject: subjects.find((item: Subject) => item.id === material.subjectId),
    uploader: uploaderMap.get(material.uploadedBy),
  }));

  return (
    <div className="space-y-6">
      <section className="panel rounded-[32px] border p-6">
        <div className="mb-4 inline-flex rounded-full bg-[rgba(42,157,143,0.12)] p-3 text-[var(--accent)]">
          <BookOpenText className="h-5 w-5" />
        </div>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Study material panel</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
          Teachers can upload PDFs subject-wise. Students can browse and download study notes anytime.
        </p>

        {params.error ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{params.error}</p> : null}
        {params.success ? (
          <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{params.success}</p>
        ) : null}
      </section>

      {session.role === "TEACHER" ? (
        <section className="panel rounded-[32px] border p-6">
          <h3 className="text-xl font-semibold text-slate-900">Upload PDF</h3>
          <form action="/api/materials/upload" method="post" encType="multipart/form-data" className="mt-5 grid gap-4 md:grid-cols-[1fr_220px_1fr_auto] md:items-end">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
              <input className="input" name="title" placeholder="Revision notes title" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Subject</label>
              <select className="select" name="subjectId" required defaultValue="">
                <option value="" disabled>
                  Select subject
                </option>
                {subjects.map((subject: Subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">PDF file</label>
              <input className="input" name="file" type="file" accept="application/pdf" required />
            </div>
            <button className="btn btn-primary" type="submit">
              Upload
            </button>
          </form>
        </section>
      ) : null}

      <section className="grid gap-4">
        {materialCards.map(
          ({ material, subject, uploader }: { material: StudyMaterial; subject?: Subject; uploader?: UserRecord }) => (
          <article key={material.id} className="panel rounded-[32px] border p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge badge-accent">{subject?.name}</span>
                    <span className="badge badge-warm">{subject?.code}</span>
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold text-slate-900">{material.title}</h3>
                  <p className="mt-2 text-sm text-[var(--ink-soft)]">
                    Uploaded by {uploader?.name} on {formatDate(material.createdAt)}
                  </p>
                  <a
                    href={material.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary mt-4"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </a>
                </div>

                {session.role === "TEACHER" ? (
                  <div className="w-full max-w-md space-y-3">
                    <form action={updateMaterialAction} className="grid gap-3 rounded-3xl bg-white/80 p-4">
                      <input type="hidden" name="id" value={material.id} />
                      <input className="input" name="title" defaultValue={material.title} />
                      <select className="select" name="subjectId" defaultValue={material.subjectId}>
                        {subjects.map((subjectOption: Subject) => (
                          <option key={subjectOption.id} value={subjectOption.id}>
                            {subjectOption.name}
                          </option>
                        ))}
                      </select>
                      <button className="btn btn-secondary" type="submit">
                        Update details
                      </button>
                    </form>

                    <form action={deleteMaterialAction}>
                      <input type="hidden" name="id" value={material.id} />
                      <button className="btn btn-secondary w-full" type="submit">
                        Delete
                      </button>
                    </form>
                  </div>
                ) : null}
              </div>
            </article>
          ),
        )}
      </section>
    </div>
  );
}
