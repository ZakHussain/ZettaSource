"use client";
import { useState } from "react";
import { ProjectCreateSchema } from "@/lib/validators";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function ProjectForm({ resumeProject }: { resumeProject?: { id: string; name: string; description?: string } }) {
  const router = useRouter();
  const create = useStore(s => s.createProject);
  const [name, setName] = useState(resumeProject?.name ?? "");
  const [description, setDescription] = useState(resumeProject?.description ?? "");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = ProjectCreateSchema.safeParse({ name, description });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    const id = resumeProject?.id ?? create({ name, description });
    setError(null);
    router.replace(`/projects/new?resume=${id}`);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4" data-testid="project-form">
      <div>
        <label htmlFor="project-name" className="block text-sm mb-1 font-medium">Project Name</label>
        <input
          id="project-name"
          data-testid="project-name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="My LED Sequencer"
          className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 focus:border-teal-400/40"
          required
        />
      </div>
      <div>
        <label htmlFor="project-description" className="block text-sm mb-1 font-medium">Description</label>
        <textarea
          id="project-description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 focus:border-teal-400/40"
          placeholder="Short description (optional)"
        />
      </div>
      {error && <div className="text-[color:var(--sunset)] text-sm" role="alert">{error}</div>}
      <div className="flex gap-3">
        <button 
          type="submit"
          data-testid="create-project" 
          className="px-4 py-2 rounded-xl bg-teal-400/20 hover:bg-teal-400/30 border border-teal-400/30 transition"
        >
          Continue
        </button>
      </div>
    </form>
  );
}