"use client";
import { Note } from "@/lib/docs/types";
import { useDocsStore } from "@/lib/docs/store";
import NoteEditor from "./NoteEditor";
import { Edit3, Trash2, ExternalLink, MessageSquare, MapPin } from "lucide-react";

interface NoteItemProps {
  note: Note;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onJumpToPage: () => void;
  availableTags?: string[];
}

export default function NoteItem({ 
  note, 
  isEditing, 
  onEdit, 
  onCancelEdit, 
  onDelete, 
  onJumpToPage,
  availableTags = []
}: NoteItemProps) {
  const updateNote = useDocsStore(s => s.updateNote);

  const handleSave = (body: string, tags: string[] = []) => {
    updateNote(note.id, body, tags);
    onCancelEdit();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const isSelectionNote = !!note.anchor.rect;

  return (
    <div 
      className="card-base p-3 group hover:shadow-md transition-all duration-200"
      data-testid={`note-item-${note.id}`}
    >
      {isEditing ? (
        <NoteEditor
          initialValue={note.body}
          initialTags={note.tags}
          onSave={(body, tags) => handleSave(body, tags)}
          onCancel={onCancelEdit}
          placeholder="Edit note..."
          showTags
          availableTags={availableTags}
        />
      ) : (
        <>
          {/* Note Content */}
          <div className="space-y-2">
            {/* Note Header */}
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1 rounded ${
                isSelectionNote 
                  ? 'bg-teal-500/20 text-teal-400' 
                  : 'bg-purple-500/20 text-purple-400'
              }`}>
                {isSelectionNote ? (
                  <MessageSquare className="w-3 h-3" />
                ) : (
                  <MapPin className="w-3 h-3" />
                )}
              </div>
              <span className="text-xs text-white/60">
                {isSelectionNote ? 'Selection Note' : 'Page Note'}
              </span>
            </div>

            <div className="text-sm leading-relaxed">
              {note.body}
            </div>
            
            {/* Tags */}
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {note.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 bg-teal-500/20 text-teal-300 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Note Meta */}
            <div className="flex items-center justify-between text-xs text-white/50">
              <div className="flex items-center gap-2">
                <button
                  onClick={onJumpToPage}
                  className="flex items-center gap-1 hover:text-teal-300 transition"
                  title={`Jump to page ${note.anchor.page}${isSelectionNote ? ' (selection)' : ''}`}
                >
                  <ExternalLink className="w-3 h-3" />
                  Page {note.anchor.page}
                </button>
              </div>
              <div>
                {note.updatedAt !== note.createdAt ? 
                  `Edited ${formatDate(note.updatedAt)}` :
                  formatDate(note.createdAt)
                }
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="p-1.5 rounded hover:bg-white/10 transition"
              title="Edit note"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded hover:bg-red-500/20 text-red-400 transition"
              title="Delete note"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}