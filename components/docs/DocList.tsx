"use client";
import { Doc } from "@/lib/docs/types";
import { FileText, ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";

interface DocListProps {
  docs: Doc[];
  projectId: string;
  onDelete: (docId: string) => void;
}

export default function DocList({ docs, projectId, onDelete }: DocListProps) {
  const formatFileSize = (bytes: number) => {
    const mb = bytes / 1024 / 1024;
    return mb < 1 ? `${Math.round(bytes / 1024)}KB` : `${mb.toFixed(1)}MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getSourceInfo = (doc: Doc) => {
    if (doc.source.kind === "upload") {
      return {
        type: "Upload",
        detail: formatFileSize(doc.source.size),
        icon: FileText
      };
    } else {
      return {
        type: "URL",
        detail: new URL(doc.source.url).hostname,
        icon: ExternalLink
      };
    }
  };

  const handleDelete = (docId: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      onDelete(docId);
    }
  };

  return (
    <div data-testid="doc-list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {docs.map(doc => {
        const sourceInfo = getSourceInfo(doc);
        const Icon = sourceInfo.icon;

        return (
          <div key={doc.id} className="card-base p-4 group">
            <Link 
              href={`/projects/${projectId}/docs/${doc.id}`}
              className="block group-hover:ring-1 group-hover:ring-teal-400/40 group-hover:shadow-md rounded-lg transition-all duration-200 -m-4 p-4"
            >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Icon className="w-6 h-6 text-teal-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm mb-1 truncate" title={doc.title}>
                  {doc.title}
                </h3>
                
                <div className="flex items-center gap-2 text-xs text-white/60 mb-2">
                  <span className="px-2 py-0.5 bg-white/10 rounded-full">
                    {sourceInfo.type}
                  </span>
                  <span>{sourceInfo.detail}</span>
                </div>
                
                <div className="text-xs text-white/50">
                  Added {formatDate(doc.createdAt)}
                </div>
              </div>
            </div>
            </Link>
            
            <div className="flex justify-end mt-2">
              <button
                onClick={() => handleDelete(doc.id, doc.title)}
                className="p-1 rounded hover:bg-red-500/20 text-white/60 hover:text-red-400 transition"
                title="Delete document"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}