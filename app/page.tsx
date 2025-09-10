"use client";
import { useStore } from "@/lib/store";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import Link from "next/link";

export default function Home() {
  const projects = useStore(s => s.projects);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Projects</h1>
        <Link href="/projects/new" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 transition">
          New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => (
            <Card key={p.id} className="card-hover">
              <div className="flex flex-col gap-2">
                <div className="text-lg font-medium">{p.name}</div>
                <div className="text-white/60 text-sm">{p.description}</div>
                {p.boardId ? (
                  <div className="text-xs text-white/60">
                    Board selected: <span className="text-white/80">{p.boardId}</span>
                  </div>
                ) : (
                  <div className="text-xs text-white/60">No board selected</div>
                )}
                <div className="pt-2">
                  <div className="flex gap-3">
                    <Link href={`/projects/new?resume=${p.id}`} className="text-[color:var(--teal)] hover:underline">
                      Components
                    </Link>
                    <Link href={`/projects/${p.id}/behavior`} className="text-[color:var(--teal)] hover:underline">
                      Behavior
                    </Link>
                    <Link href={`/projects/${p.id}/docs`} className="text-[color:var(--teal)] hover:underline">
                      Documents
                    </Link>
                    <Link href={`/projects/${p.id}/docs`} className="text-[color:var(--teal)] hover:underline">
                      Documents
                    </Link>                    
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}