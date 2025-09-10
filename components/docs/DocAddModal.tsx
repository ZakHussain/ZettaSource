"use client";
import { useState } from "react";
import { X, Upload, Link as LinkIcon } from "lucide-react";

interface DocAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (input: { title: string; source: any }) => void;
}

export default function DocAddModal({ isOpen, onClose, onAdd }: DocAddModalProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const reset = () => {
    setTitle("");
    setFile(null);
    setUrl("");
    setError("");
    setActiveTab("upload");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate PDF
    if (selectedFile.type !== "application/pdf") {
      setError("Please select a PDF file only");
      setFile(null);
      return;
    }
    
    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (selectedFile.size > maxSize) {
      setError("PDF file is too large (max 50MB)");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError("");
    
    // Auto-fill title if empty
    if (!title) {
      setTitle(selectedFile.name.replace(/\.pdf$/i, ""));
    }
  };

  const validateUrl = (urlString: string) => {
    try {
      const urlObj = new URL(urlString);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please enter a document title");
      return;
    }

    if (activeTab === "upload") {
      if (!file) {
        setError("Please select a PDF file");
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      onAdd({
        title: title.trim(),
        source: {
          kind: "upload",
          name: file.name,
          size: file.size,
          mime: file.type,
          localUrl: objectUrl
        }
      });
    } else {
      if (!url.trim()) {
        setError("Please enter a document URL");
        return;
      }

      if (!validateUrl(url.trim())) {
        setError("Please enter a valid HTTP or HTTPS URL");
        return;
      }

      onAdd({
        title: title.trim(),
        source: {
          kind: "url",
          url: url.trim()
        }
      });
    }

    handleClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card-base p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Add Document</h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-md transition ${
              activeTab === "upload" 
                ? "bg-white/10 text-white" 
                : "text-white/60 hover:text-white/80"
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload PDF
          </button>
          <button
            onClick={() => setActiveTab("url")}
            className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-md transition ${
              activeTab === "url" 
                ? "bg-white/10 text-white" 
                : "text-white/60 hover:text-white/80"
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            Add URL
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <div>
            <label htmlFor="doc-title" className="block text-sm mb-1 font-medium">
              Document Title
            </label>
            <input
              id="doc-title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter document title"
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 focus:border-teal-400/40"
              required
            />
          </div>

          {/* Upload Tab Content */}
          {activeTab === "upload" && (
            <div>
              <label htmlFor="doc-file" className="block text-sm mb-1 font-medium">
                PDF File
              </label>
              <input
                id="doc-file"
                data-testid="doc-upload-input"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-white/10 file:text-white hover:file:bg-white/20"
                required
              />
              {file && (
                <div className="mt-2 text-sm text-white/60">
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
                </div>
              )}
            </div>
          )}

          {/* URL Tab Content */}
          {activeTab === "url" && (
            <div>
              <label htmlFor="doc-url" className="block text-sm mb-1 font-medium">
                Document URL
              </label>
              <input
                id="doc-url"
                data-testid="doc-url-input"
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com/document.pdf"
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 focus:border-teal-400/40"
                required
              />
              <p className="text-xs text-white/50 mt-1">
                Enter a direct link to a PDF document
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-red-400 text-sm" role="alert">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-teal-400/20 hover:bg-teal-400/30 border border-teal-400/30 transition"
            >
              Add Document
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}