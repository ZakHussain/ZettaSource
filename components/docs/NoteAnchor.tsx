"use client";
import { useState, useEffect } from "react";
import { Note } from "@/lib/docs/types";
import { MessageSquare, MapPin, Check } from "lucide-react";

interface NoteAnchorProps {
  note: Note;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onClick: () => void;
}

export default function NoteAnchor({ note, canvasRef, onClick }: NoteAnchorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [showNotifier, setShowNotifier] = useState(false);

  const getPosition = () => {
    if (!canvasRef.current) return { x: 0, y: 0, width: 0, height: 0 };
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    if (note.anchor.rect) {
      // Selection note - position based on rect
      const [x, y, width, height] = note.anchor.rect;
      return {
        x: x * canvas.width,
        y: y * canvas.height,
        width: width * canvas.width,
        height: height * canvas.height
      };
    } else {
      // Page note - position at top-left
      return {
        x: 20,
        y: 20,
        width: 0,
        height: 0
      };
    }
  };

  const { x, y, width, height } = getPosition();
  const isSelectionNote = !!note.anchor.rect;

  // Show notifier for new selection notes
  useEffect(() => {
    if (isSelectionNote) {
      setShowNotifier(true);
      const timer = setTimeout(() => {
        setShowNotifier(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSelectionNote]);

  return (
    <>
      {/* Selection highlight for text selection notes */}
      {isSelectionNote && (
        <div
          className="absolute border border-teal-400/60 bg-teal-400/10 pointer-events-none"
          style={{
            left: x,
            top: y,
            width: width,
            height: height
          }}
        />
      )}
      
      {/* Selection notifier */}
      {showNotifier && isSelectionNote && (
        <div
          className="absolute z-30 flex items-center gap-2 px-3 py-2 bg-teal-500 text-white text-sm rounded-lg shadow-lg pointer-events-none animate-fade-out"
          style={{
            left: x + width / 2 - 50, // Center horizontally on selection
            top: y - 40 // Position above selection
          }}
        >
          <Check className="w-4 h-4" />
          <span>Note Added!</span>
        </div>
      )}
      
      {/* Note marker/pin */}
      <button
        className={`absolute w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 z-10 ${
          isSelectionNote 
            ? 'bg-teal-500 hover:bg-teal-400 text-white' 
            : 'bg-purple-500 hover:bg-purple-400 text-white'
        } hover:scale-110 shadow-md`}
        style={{
          left: isSelectionNote ? x + width - 12 : x,
          top: isSelectionNote ? y - 12 : y
        }}
        onClick={onClick}
        onMouseEnter={() => setShowPreview(true)}
        onMouseLeave={() => setShowPreview(false)}
        title={note.body.substring(0, 100) + (note.body.length > 100 ? '...' : '')}
      >
        {isSelectionNote ? (
          <MessageSquare className="w-3 h-3" />
        ) : (
          <MapPin className="w-3 h-3" />
        )}
      </button>

      {/* Note preview tooltip */}
      {showPreview && (
        <div
          className="absolute z-20 max-w-xs p-3 bg-gray-900 border border-gray-700 rounded-lg shadow-xl pointer-events-none"
          style={{
            left: isSelectionNote ? x + width + 10 : x + 30,
            top: isSelectionNote ? y : y + 30
          }}
        >
          <div className="text-sm text-white">
            {note.body.substring(0, 150)}
            {note.body.length > 150 && '...'}
          </div>
          {note.tags && note.tags.length > 0 && (
            <div className="flex gap-1 mt-2">
              {note.tags.map(tag => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 bg-gray-700 rounded-full text-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="text-xs text-gray-400 mt-1">
            Page {note.anchor.page} • {isSelectionNote ? 'Selection' : 'Page'} note
          </div>
        </div>
      )}
    </>
  );
}