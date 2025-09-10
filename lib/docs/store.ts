import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Doc, DocId, DocSource, Note, NoteId, PageAnchor } from "./types";

type DocsState = {
  documents: Doc[];
  notes: Note[];
  searchQuery: string;
  selectedTags: string[];
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: string[]) => void;
  clearFilters: () => void;
  addDoc: (projectId: string, input: { title: string; source: DocSource }) => DocId;
  removeDoc: (projectId: string, docId: DocId) => void;
  updateDocLastPage: (docId: DocId, page: number) => void;
  getDocsByProject: (projectId: string) => Doc[];
  addNote: (docId: DocId, anchor: PageAnchor, body: string, tags?: string[]) => NoteId;
  updateNote: (noteId: NoteId, body: string, tags?: string[]) => void;
  removeNote: (noteId: NoteId) => void;
  getNotesByDoc: (docId: DocId) => Note[];
  getFilteredNotes: (docId: DocId) => Note[];
  getAllTags: (docId: DocId) => string[];
};

export const useDocsStore = create<DocsState>()(
  persist(
    (set, get) => ({
      documents: [],
      notes: [],
      searchQuery: "",
      selectedTags: [],
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedTags: (tags) => set({ selectedTags: tags }),
      clearFilters: () => set({ searchQuery: "", selectedTags: [] }),
      
      addDoc: (projectId, input) => {
        const id = Date.now().toString();
        const newDoc: Doc = {
          id,
          projectId,
          title: input.title,
          source: input.source,
          lastViewedPage: 1,
          createdAt: new Date().toISOString(),
        };
        
        set(state => ({
          documents: [...state.documents, newDoc]
        }));
        
        return id;
      },
      
      removeDoc: (projectId, docId) => {
        const state = get();
        const doc = state.documents.find(d => d.id === docId && d.projectId === projectId);
        
        // Clean up Object URL if it's an uploaded file
        if (doc?.source.kind === "upload") {
          try {
            URL.revokeObjectURL(doc.source.localUrl);
          } catch (error) {
            console.warn('Error revoking Object URL:', error);
          }
        }
        
        set(state => ({
          documents: state.documents.filter(d => !(d.id === docId && d.projectId === projectId))
        }));
      },
      
      updateDocLastPage: (docId, page) => {
        set(state => ({
          documents: state.documents.map(doc =>
            doc.id === docId ? { ...doc, lastViewedPage: page } : doc
          )
        }));
      },
      
      getDocsByProject: (projectId) => {
        return get().documents.filter(d => d.projectId === projectId);
      },
      
      addNote: (docId, anchor, body, tags = []) => {
        const id = Date.now().toString();
        const now = new Date().toISOString();
        
        const newNote: Note = {
          id,
          docId,
          body: body.trim(),
          tags,
          anchor,
          createdAt: now,
          updatedAt: now,
        };
        
        set(state => ({
          notes: [...state.notes, newNote]
        }));
        
        return id;
      },
      
      updateNote: (noteId, body, tags = []) => {
        const now = new Date().toISOString();
        set(state => ({
          notes: state.notes.map(note =>
            note.id === noteId
              ? { ...note, body: body.trim(), tags, updatedAt: now }
              : note
          )
        }));
      },
      
      removeNote: (noteId) => {
        set(state => ({
          notes: state.notes.filter(note => note.id !== noteId)
        }));
      },
      
      getNotesByDoc: (docId) => {
        return get().notes
          .filter(note => note.docId === docId)
          .sort((a, b) => a.anchor.page - b.anchor.page);
      },
      
      getFilteredNotes: (docId) => {
        const state = get();
        let filtered = state.notes.filter(note => note.docId === docId);
        
        // Filter by search query
        if (state.searchQuery) {
          const query = state.searchQuery.toLowerCase();
          filtered = filtered.filter(note => 
            note.body.toLowerCase().includes(query) ||
            note.tags?.some(tag => tag.toLowerCase().includes(query))
          );
        }
        
        // Filter by selected tags
        if (state.selectedTags.length > 0) {
          filtered = filtered.filter(note =>
            note.tags?.some(tag => state.selectedTags.includes(tag))
          );
        }
        
        return filtered.sort((a, b) => a.anchor.page - b.anchor.page);
      },
      
      getAllTags: (docId) => {
        const notes = get().notes.filter(note => note.docId === docId);
        const allTags = notes.flatMap(note => note.tags || []);
        return [...new Set(allTags)].sort();
      }
    }),
    { 
      name: "zettasource-docs-store",
      // Don't persist Object URLs as they're temporary
      partialize: (state) => ({
        documents: state.documents.map(doc => ({
          ...doc,
          source: doc.source.kind === "upload" 
            ? { ...doc.source, localUrl: "" } // Clear Object URLs on persist
            : doc.source
        }))
      })
    }
  )
);