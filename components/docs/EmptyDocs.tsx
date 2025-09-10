import { FileText } from "lucide-react";

interface EmptyDocsProps {
  onAdd: () => void;
}

export default function EmptyDocs({ onAdd }: EmptyDocsProps) {
  return (
    <div className="card-base p-10 text-center">
      <div className="flex justify-center mb-4">
        <FileText className="w-12 h-12 text-white/40" />
      </div>
      <h2 className="text-xl font-semibold mb-2">No documents yet</h2>
      <p className="text-white/70 mb-6">
        Upload PDF files or add documents by URL to get started with your project documentation.
      </p>
      <button
        onClick={onAdd}
        className="px-4 py-2 rounded-xl bg-teal-400/20 hover:bg-teal-400/30 border border-teal-400/30 transition"
      >
        Add Your First Document
      </button>
    </div>
  );
}