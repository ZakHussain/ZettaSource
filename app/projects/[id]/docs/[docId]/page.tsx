"use client";
import { useParams } from "next/navigation";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useStore } from "@/lib/store";
import { useDocsStore } from "@/lib/docs/store";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PdfViewer from "@/components/docs/PdfViewer";
import DocToolbar from "@/components/docs/DocToolbar";
import NotesPanel from "@/components/docs/NotesPanel";
import { PageAnchor } from "@/lib/docs/types";

export default function DocumentViewerPage() {
  const { id: projectId, docId } = useParams() as { id: string; docId: string };
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1.0);
  const [showNotes, setShowNotes] = useState(true);
  const [noteMode, setNoteMode] = useState(false);

  // Get stable references from stores
  const projects = useStore(s => s.projects);
  const documents = useDocsStore(s => s.documents);
  const notes = useDocsStore(s => s.notes);
  const addNote = useDocsStore(s => s.addNote);
  const updateDocLastPage = useDocsStore(s => s.updateDocLastPage);

  // Use useMemo for derived data to prevent infinite loops
  const project = useMemo(() => 
    projects.find(p => p.id === projectId), 
    [projects, projectId]
  );
  
  const document = useMemo(() => 
    documents.find(d => d.id === docId && d.projectId === projectId), 
    [documents, docId, projectId]
  );

  const documentNotes = useMemo(() =>
    notes.filter(note => note.docId === docId),
    [notes, docId]
  );

  // Restore last viewed page on mount
  useEffect(() => {
    if (document && document.lastViewedPage) {
      setCurrentPage(document.lastViewedPage);
    }
  }, [document?.lastViewedPage]);

  // Save current page when it changes
  useEffect(() => {
    if (currentPage > 0 && totalPages > 0) {
      // Get current document state directly to avoid circular dependency
      const currentDoc = useDocsStore.getState().documents.find(d => d.id === docId);
      if (currentDoc && currentDoc.lastViewedPage !== currentPage) {
        updateDocLastPage(docId, currentPage);
      }
    }
  }, [docId, currentPage, totalPages, updateDocLastPage]);

  if (!project) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-semibold mb-2">Project not found</h1>
        <p className="text-white/60">The project you're looking for doesn't exist.</p>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-semibold mb-2">Document not found</h1>
        <p className="text-white/60 mb-4">The document you're looking for doesn't exist.</p>
        <Link 
          href={`/projects/${projectId}/docs`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-400/20 hover:bg-teal-400/30 border border-teal-400/30 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Documents
        </Link>
      </div>
    );
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleZoomReset = () => {
    setZoom(1.0);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleTotalPagesChange = useCallback((total: number) => {
    setTotalPages(total);
    // Reset to page 1 if current page is beyond document length
    if (currentPage > total) {
      setCurrentPage(1);
    }
  }, [currentPage]);

  const handleSelectionNote = useCallback((anchor: PageAnchor) => {
    addNote(docId, anchor, "", []); // Empty body will trigger edit mode
    setNoteMode(false);
  }, [docId, addNote]);

  const handleNoteClick = useCallback((note: any) => {
    if (note.anchor.page !== currentPage) {
      setCurrentPage(note.anchor.page);
    }
    // Could add more logic here like scrolling to note in sidebar
  }, [currentPage]);

  const toggleNoteMode = useCallback(() => {
    setNoteMode(!noteMode);
  }, [noteMode]);

  // Get PDF source URL
  const getPdfSource = () => {
    if (document.source.kind === "upload") {
      return document.source.localUrl;
    } else {
      return document.source.url;
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:max-h-screen">
      {/* Back Navigation */}
      <div className="mb-4">
        <Link 
          href={`/projects/${projectId}/docs`}
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Documents
        </Link>
      </div>

      {/* Document Toolbar */}
      <DocToolbar
        title={document.title}
        currentPage={currentPage}
        totalPages={totalPages}
        zoom={zoom}
        onPageChange={handlePageChange}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        showNotes={showNotes}
        onToggleNotes={() => setShowNotes(!showNotes)}
        noteMode={noteMode}
        onToggleNoteMode={toggleNoteMode}
      />

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:min-h-0">
        {/* PDF Viewer */}
        <div className={`flex-1 ${showNotes ? 'lg:flex-[2]' : ''} min-h-0`}>
          <PdfViewer
            source={getPdfSource()}
            currentPage={currentPage}
            zoom={zoom}
            noteMode={noteMode}
            notes={documentNotes}
            onPageChange={handlePageChange}
            onTotalPagesChange={handleTotalPagesChange}
            onSelectionNote={handleSelectionNote}
            onNoteClick={handleNoteClick}
          />
        </div>

        {/* Notes Panel */}
        {showNotes && (
          <div className="lg:w-80 lg:flex-shrink-0 min-h-[300px] lg:min-h-0">
            <NotesPanel
              docId={docId}
              currentPage={currentPage}
              noteMode={noteMode}
              onToggleNoteMode={toggleNoteMode}
              onJumpToPage={handlePageChange}
              onSelectionNote={handleSelectionNote}
            />
          </div>
        )}
      </div>
    </div>
  );
}