"use client";
import ProjectForm from "@/components/ProjectForm";
import BoardPicker from "@/components/BoardPicker";
import Card from "@/components/Card";
import { useStore } from "@/lib/store";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

export default function NewProjectPage() {
  const params = useSearchParams();
  const resumeId = params.get("resume") || undefined;
  const projects = useStore(s => s.projects);
  const project = useMemo(() => projects.find(p => p.id === resumeId), [projects, resumeId]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Create Project</h1>
      <Card className="card-hover">
        <ProjectForm resumeProject={project} />
      </Card>
      {project && (
        <Card className="card-hover mt-4">
          <BoardPicker projectId={project.id} />
        </Card>
      )}
    </div>
  );
}