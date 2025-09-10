"use client";
import { useParams } from "next/navigation";
import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { useDocsStore } from "@/lib/docs/store";
import { Plus } from "lucide-react";
import DocList from "@/components/docs/DocList";
import DocAddModal from "@/components/docs/DocAddModal";
import EmptyDocs from "@/components/docs/EmptyDocs";

export default function DocumentsPage() {
  const { id: projectId } = useParams() as { id: string };
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get stable references from stores
  const projects = useStore(s => s.projects);
  const documents = useDocsStore(s => s.documents);
  const addDoc = useDocsStore(s => s.addDoc);
  const removeDoc = useDocsStore(s => s.removeDoc);

  // Use useMemo to derive filtered/found items with stable references
  const project = useMemo(() => 
    projects.find(p => p.id === projectId), 
    [projects, projectId]
  );
  
  const docs = useMemo(() => 
    documents.filter(doc => doc.projectId === projectId), 
    [documents, projectId]
  );

  if (!project) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-semibold mb-2">Project not found</h1>
        <p className="text-white/60">The project you're looking for doesn't exist.</p>
      </div>
    );
  }

  const handleAddDoc = (input: { title: string; source: any }) => {
    addDoc(projectId, input);
  };

  const handleDeleteDoc = (docId: string) => {
    removeDoc(projectId, docId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Documents</h1>
          <p className="text-sm text-white/60 mt-1">
            Manage documents for {project.name}
          </p>
        </div>
        <button
          data-testid="doc-add"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-400/20 hover:bg-teal-400/30 border border-teal-400/30 transition"
        >
          <Plus className="w-4 h-4" />
          Add Document
        </button>
      </div>

      {docs.length === 0 ? (
        <EmptyDocs onAdd={() => setIsModalOpen(true)} />
      ) : (
        <DocList docs={docs} projectId={projectId} onDelete={handleDeleteDoc} />
      )}

      <DocAddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddDoc}
      />
    </div>
  );
}