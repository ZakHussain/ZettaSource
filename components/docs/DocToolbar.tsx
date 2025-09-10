"use client";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, StickyNote, MousePointer } from "lucide-react";

interface DocToolbarProps {
  title: string;
  currentPage: number;
  totalPages: number;
  zoom: number;
  onPageChange: (page: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  showNotes: boolean;
  onToggleNotes: () => void;
  noteMode?: boolean;
  onToggleNoteMode?: () => void;
}

export default function DocToolbar({
  title,
  currentPage,
  totalPages,
  zoom,
  onPageChange,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onPrevPage,
  onNextPage,
  showNotes,
  onToggleNotes,
  noteMode = false,
  onToggleNoteMode
}: DocToolbarProps) {
  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="card-base p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Document Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold truncate" title={title}>
          {title}
        </h1>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Page Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevPage}
            disabled={currentPage <= 1}
            className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-1 text-sm">
            <input
              type="number"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={handlePageInput}
              data-testid="page-number"
              className="w-16 px-2 py-1 rounded bg-white/5 border border-white/10 text-center focus:border-teal-400/40"
            />
            <span className="text-white/60">of {totalPages}</span>
          </div>
          
          <button
            onClick={onNextPage}
            disabled={currentPage >= totalPages}
            className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={onZoomOut}
            className="p-2 rounded-lg hover:bg-white/10 transition"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <span className="text-sm text-white/60 min-w-[4rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          
          <button
            onClick={onZoomIn}
            className="p-2 rounded-lg hover:bg-white/10 transition"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <button
            onClick={onZoomReset}
            className="p-2 rounded-lg hover:bg-white/10 transition"
            title="Reset zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
        
        {/* Notes Toggle */}
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleNotes}
            className={`p-2 rounded-lg transition ${
              showNotes ? 'bg-teal-400/20 text-teal-300' : 'hover:bg-white/10'
            }`}
            title={showNotes ? "Hide notes" : "Show notes"}
          >
            <StickyNote className="w-4 h-4" />
          </button>
          
          {onToggleNoteMode && (
            <button
              onClick={onToggleNoteMode}
              className={`p-2 rounded-lg transition ${
                noteMode ? 'bg-purple-400/20 text-purple-300' : 'hover:bg-white/10'
              }`}
              title={noteMode ? "Exit selection mode" : "Enter selection mode"}
            >
              <MousePointer className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}