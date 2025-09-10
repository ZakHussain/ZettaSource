"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { boards } from "@/lib/mock";
import BoardCard from "./BoardCard";
import { useStore } from "@/lib/store";

export default function BoardPicker({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const project = useStore(s => s.projects.find(p => p.id === projectId));
  const select = useStore(s => s.selectBoard);

  const filtered = useMemo(() => {
    const query = q.toLowerCase();
    return boards.filter(b =>
      [b.name, b.fqbn, b.voltage, b.tags.join(" ")].join(" ").toLowerCase().includes(query)
    );
  }, [q]);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Select Board</h2>
          <p className="text-sm text-white/60">Choose the Arduino/ESP board for this project.</p>
        </div>
        <input
          data-testid="board-search"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search boards..."
          className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 focus:border-teal-400/40"
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(b => (
          <BoardCard
            key={b.id}
            board={b}
            selected={project?.boardId === b.id}
            onSelect={() => select(projectId, b.id)}
          />
        ))}
      </div>

      {project?.boardId && (
        <div className="text-sm text-white/70 mt-4">
          Selected: <span className="text-white/90">{project.boardId}</span>
        </div>
      )}

      {project?.boardId && (
        <div className="flex justify-end mt-6">
          <button
            onClick={() => router.push(`/projects/${projectId}/pins`)}
            className="px-6 py-3 rounded-xl bg-teal-400/20 hover:bg-teal-400/30 border border-teal-400/30 transition font-medium"
            data-testid="continue-to-pins"
          >
            Continue to Pin Mapping →
          </button>
        </div>
      )}
    </div>
  );
}