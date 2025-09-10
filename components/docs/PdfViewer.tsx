"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { loadPdfDocument, renderPdfPage, cleanupPdfDocument } from "@/lib/docs/pdf";
import { Loader2, FileX } from "lucide-react";
import NoteAnchor from "./NoteAnchor";
import { Note, PageAnchor } from "@/lib/docs/types";

interface PdfViewerProps {
  source: string;
  currentPage: number;
  zoom: number;
  noteMode?: boolean;
  notes?: Note[];
  onPageChange?: (page: number) => void;
  onTotalPagesChange?: (total: number) => void;
  onSelectionNote?: (anchor: PageAnchor) => void;
  onNoteClick?: (note: Note) => void;
}

export default function PdfViewer({ 
  source, 
  currentPage, 
  zoom, 
  noteMode = false,
  notes = [],
  onPageChange,
  onTotalPagesChange,
  onSelectionNote,
  onNoteClick
}: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [selectionRect, setSelectionRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // Load PDF document
  useEffect(() => {
    let isMounted = true;
    let currentPdfDoc: any = null;
    
    const loadDocument = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const doc = await loadPdfDocument(source);
        
        if (isMounted) {
          currentPdfDoc = doc;
          setPdfDoc(doc);
          const pages = doc.numPages;
          setTotalPages(pages);
          onTotalPagesChange?.(pages);
        }
      } catch (err) {
        if (isMounted) {
          console.error('PDF loading error:', err);
          setError(err instanceof Error ? err.message : 'Failed to load PDF');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (source) {
      loadDocument();
    }

    return () => {
      isMounted = false;
      // Clean up when component unmounts or source changes
      if (currentPdfDoc) {
        cleanupPdfDocument(currentPdfDoc);
      }
    };
  }, [source, onTotalPagesChange]); 
  
  // Render current page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || currentPage < 1 || currentPage > totalPages) {
      return;
    }

    let isMounted = true;

    const renderPage = async () => {
      try {
        const canvas = canvasRef.current;
        if (!canvas || !isMounted) return;

        await renderPdfPage(pdfDoc, currentPage, canvas, zoom);
      } catch (err) {
        if (isMounted) {
          console.error('PDF rendering error:', err);
          setError('Failed to render PDF page');
        }
      }
    };

    renderPage();

    return () => {
      isMounted = false;
    };
  }, [pdfDoc, currentPage, zoom, totalPages]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!noteMode || !canvasRef.current || !containerRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsSelecting(true);
    setSelectionStart({ x, y });
    setSelectionRect({ x, y, width: 0, height: 0 });
  }, [noteMode]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isSelecting || !selectionStart || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    const width = currentX - selectionStart.x;
    const height = currentY - selectionStart.y;
    
    setSelectionRect({
      x: width < 0 ? currentX : selectionStart.x,
      y: height < 0 ? currentY : selectionStart.y,
      width: Math.abs(width),
      height: Math.abs(height)
    });
  }, [isSelecting, selectionStart]);

  const handleMouseUp = useCallback(() => {
    if (!isSelecting || !selectionRect || !canvasRef.current || !onSelectionNote) {
      setIsSelecting(false);
      setSelectionStart(null);
      setSelectionRect(null);
      return;
    }
    
    const canvas = canvasRef.current;
    const { x, y, width, height } = selectionRect;
    
    // Convert to normalized coordinates (0-1)
    const normalizedRect: [number, number, number, number] = [
      x / canvas.width,
      y / canvas.height,
      width / canvas.width,
      height / canvas.height
    ];
    
    // Only create note if selection is meaningful (not just a click)
    if (width > 10 && height > 10) {
      onSelectionNote({
        page: currentPage,
        rect: normalizedRect
      });
    }
    
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionRect(null);
  }, [isSelecting, selectionRect, currentPage, onSelectionNote]);

  const currentPageNotes = notes.filter(note => note.anchor.page === currentPage);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-white/60">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <FileX className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load PDF</h3>
          <p className="text-white/60 max-w-md">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`flex-1 flex items-center justify-center p-4 bg-white/5 rounded-lg relative ${
        noteMode ? 'cursor-crosshair' : 'cursor-default'
      }`}
    >
      <div className="max-w-full max-h-full overflow-auto">
        <div className="relative">
          <canvas
            ref={canvasRef}
            data-testid="pdf-canvas"
            className="max-w-full max-h-full shadow-lg"
            style={{ 
              display: 'block',
              margin: '0 auto'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />
          
          {/* Selection Rectangle Overlay */}
          {selectionRect && (
            <div
              className="absolute border-2 border-teal-400 bg-teal-400/20 pointer-events-none"
              style={{
                left: selectionRect.x,
                top: selectionRect.y,
                width: selectionRect.width,
                height: selectionRect.height
              }}
            />
          )}
          
          {/* Note Anchors */}
          {currentPageNotes.map(note => (
            <NoteAnchor
              key={note.id}
              note={note}
              canvasRef={canvasRef}
              onClick={() => onNoteClick?.(note)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}