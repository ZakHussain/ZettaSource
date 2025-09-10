"use client";
import { useState, useMemo, useCallback } from "react";
import { useDocsStore } from "@/lib/docs/store";
import { Note, DocId, PageAnchor } from "@/lib/docs/types";
import NoteItem from "./NoteItem";
import NoteEditor from "./NoteEditor";
import { Plus, Search, X, Tag, Filter } from "lucide-react";

interface NotesPanelProps {
  docId: DocId;
  currentPage: number;
  noteMode?: boolean;
  onToggleNoteMode?: () => void;
  onJumpToPage: (page: number) => void;
  onSelectionNote?: (anchor: PageAnchor) => void;
}

export default function NotesPanel({ 
  docId, 
  currentPage, 
  noteMode = false,
  onToggleNoteMode,
  onJumpToPage,
  onSelectionNote
}: NotesPanelProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const allNotes = useDocsStore(s => s.notes);
  const searchQuery = useDocsStore(s => s.searchQuery);
  const selectedTags = useDocsStore(s => s.selectedTags);
  const setSearchQuery = useDocsStore(s => s.setSearchQuery);
  const setSelectedTags = useDocsStore(s => s.setSelectedTags);
  const clearFilters = useDocsStore(s => s.clearFilters);
  const getFilteredNotes = useDocsStore(s => s.getFilteredNotes);
  const getAllTags = useDocsStore(s => s.getAllTags);
  const addNote = useDocsStore(s => s.addNote);
  const removeNote = useDocsStore(s => s.removeNote);

  const notes = useMemo(() => getFilteredNotes(docId), [getFilteredNotes, docId]);
  const allAvailableTags = useMemo(() => getAllTags(docId), [getAllTags, docId]);
  const allNotesCount = useMemo(() => 
    allNotes.filter(note => note.docId === docId).length,
    [allNotes, docId]
  );

  const handleCreateNote = useCallback((body: string, tags: string[] = []) => {
    addNote(docId, { page: currentPage }, body, tags);
    setIsCreating(false);
  }, [docId, currentPage, addNote]);

  const handleDeleteNote = useCallback((noteId: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      removeNote(noteId);
      if (editingNoteId === noteId) {
        setEditingNoteId(null);
      }
    }
  }, [removeNote, editingNoteId]);

  const handleTagClick = useCallback((tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  }, [selectedTags, setSelectedTags]);

  // Group notes by page
  const notesByPage = notes.reduce((acc, note) => {
    const page = note.anchor.page;
    if (!acc[page]) acc[page] = [];
    acc[page].push(note);
    return acc;
  }, {} as Record<number, Note[]>);

  const sortedPages = Object.keys(notesByPage)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="card-base p-4 h-full flex flex-col" data-testid="notes-panel">
      {/* Header */}
      <div className="space-y-4 mb-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-lg">Notes</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition ${
                showFilters || searchQuery || selectedTags.length > 0
                  ? 'bg-teal-400/20 text-teal-300' 
                  : 'hover:bg-white/10'
              }`}
              title="Toggle filters"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        {showFilters && (
          <div className="space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:border-teal-400/40"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Tag Filter */}
            {allAvailableTags.length > 0 && (
              <div>
                <div className="text-sm text-white/60 mb-2">Filter by tags:</div>
                <div className="flex flex-wrap gap-1">
                  {allAvailableTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className={`text-xs px-2 py-1 rounded-full transition ${
                        selectedTags.includes(tag)
                          ? 'bg-teal-400/20 text-teal-300 border border-teal-400/40'
                          : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Clear Filters */}
            {(searchQuery || selectedTags.length > 0) && (
              <button
                onClick={clearFilters}
                className="text-sm text-white/60 hover:text-white transition"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsCreating(true)}
            disabled={isCreating}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-400/20 hover:bg-teal-400/30 border border-teal-400/30 transition text-sm disabled:opacity-50"
            title={`Add page note for page ${currentPage}`}
          >
            <Plus className="w-4 h-4" />
            Page Note
          </button>
          {onToggleNoteMode && (
            <button
              onClick={onToggleNoteMode}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition text-sm ${
                noteMode 
                  ? 'bg-purple-400/20 hover:bg-purple-400/30 border border-purple-400/30 text-purple-300' 
                  : 'bg-white/5 hover:bg-white/10 border border-white/10'
              }`}
              title={noteMode ? "Exit selection mode" : "Enter selection mode"}
            >
              <Tag className="w-4 h-4" />
              {noteMode ? 'Exit' : 'Select'}
            </button>
          )}
        </div>
        
        {/* Results Summary */}
        {(searchQuery || selectedTags.length > 0) && (
          <div className="text-sm text-white/60">
            Showing {notes.length} of {allNotesCount} notes
          </div>
        )}
      </div>

      {noteMode && (
        <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
          <div className="text-sm text-purple-300 font-medium mb-1">Selection Mode Active</div>
          <div className="text-xs text-purple-200/80">
            Drag on the PDF to create a selection note
          </div>
        </div>
      )}

      {/* Note Creation */}
      {isCreating && (
        <div className="mb-4">
          <div className="text-sm text-white/60 mb-2">
            Adding note for page {currentPage}
          </div>
          <NoteEditor
            onSave={(body, tags) => handleCreateNote(body, tags)}
            onCancel={() => setIsCreating(false)}
            placeholder="Enter your note..."
            showTags
            availableTags={allAvailableTags}
          />
        </div>
      )}

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {notes.length === 0 && !isCreating ? (
          <div className="text-center text-white/60 py-8">
            {searchQuery || selectedTags.length > 0 ? (
              <div>
                <div className="text-sm">No matching notes found</div>
                <button
                  onClick={clearFilters}
                  className="text-xs text-teal-300 hover:underline mt-1"
                >
                  Clear filters to show all notes
                </button>
              </div>
            ) : (
              <div>
                <div className="text-sm">No notes yet</div>
                <div className="text-xs text-white/40 mt-1">
                  Click "Page Note" or use selection mode to create your first note
                </div>
              </div>
            )}
          </div>
        ) : (
          sortedPages.map(page => (
            <div key={page} className="space-y-2">
              {/* Page Header */}
              <div 
                className={`text-sm font-medium px-2 py-1 rounded ${
                  page === currentPage 
                    ? 'bg-teal-400/20 text-teal-300' 
                    : 'text-white/60'
                }`}
              >
                Page {page}
              </div>
              
              {/* Notes for this page */}
              {notesByPage[page].map(note => (
                <NoteItem
                  key={note.id}
                  note={note}
                  isEditing={editingNoteId === note.id}
                  onEdit={() => setEditingNoteId(note.id)}
                  onCancelEdit={() => setEditingNoteId(null)}
                  onDelete={() => handleDeleteNote(note.id)}
                  onJumpToPage={() => onJumpToPage(note.anchor.page)}
                  availableTags={allAvailableTags}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}