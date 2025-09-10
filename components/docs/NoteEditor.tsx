"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Check, X } from "lucide-react";

interface NoteEditorProps {
  initialValue?: string;
  initialTags?: string[];
  placeholder?: string;
  showTags?: boolean;
  availableTags?: string[];
  onSave: (body: string, tags?: string[]) => void;
  onCancel: () => void;
}

export default function NoteEditor({ 
  initialValue = "", 
  initialTags = [],
  placeholder = "Enter note...", 
  showTags = false,
  availableTags = [],
  onSave, 
  onCancel 
}: NoteEditorProps) {
  const [body, setBody] = useState(initialValue);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-focus and resize textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  const handleSave = () => {
    const trimmedBody = body.trim();
    if (!trimmedBody) {
      setError("Note cannot be empty");
      return;
    }
    
    setError("");
    onSave(trimmedBody, showTags ? tags : undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(e.target.value);
    setError("");
    
    // Auto-resize textarea
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleTagInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput("");
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  }, [tagInput, tags]);

  const removeTag = useCallback((tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  }, [tags]);

  const addSuggestedTag = useCallback((tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput("");
  }, [tags]);

  return (
    <div className="space-y-3">
      <div>
        <textarea
          ref={textareaRef}
          value={body}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full min-h-[80px] px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-teal-400/40 resize-none transition"
          rows={3}
        />
        {error && (
          <div className="text-red-400 text-xs mt-1" role="alert">
            {error}
          </div>
        )}
      </div>

      {/* Tags Input */}
      {showTags && (
        <div className="space-y-2">
          <label className="block text-sm">Tags (optional)</label>
          
          {/* Current Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-teal-500/20 text-teal-300 rounded-full"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-teal-300 hover:text-red-400 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          
          {/* Tag Input */}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            placeholder="Type tags and press Enter..."
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-teal-400/40 text-sm transition"
          />
          
          {/* Tag Suggestions */}
          {availableTags.length > 0 && tagInput && (
            <div className="space-y-1">
              <div className="text-xs text-white/60">Suggestions:</div>
              <div className="flex flex-wrap gap-1">
                {availableTags
                  .filter(tag => 
                    tag.toLowerCase().includes(tagInput.toLowerCase()) &&
                    !tags.includes(tag)
                  )
                  .slice(0, 5)
                  .map(tag => (
                    <button
                      key={tag}
                      onClick={() => addSuggestedTag(tag)}
                      className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded-full transition"
                    >
                      {tag}
                    </button>
                  ))}
              </div>
            </div>
          )}
          
          <div className="text-xs text-white/50">
            Press Enter or comma to add tags
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-400/20 hover:bg-teal-400/30 border border-teal-400/30 transition text-sm"
        >
          <Check className="w-3.5 h-3.5" />
          Save
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition text-sm"
        >
          <X className="w-3.5 h-3.5" />
          Cancel
        </button>
      </div>
      
      <div className="text-xs text-white/50">
        Press Ctrl+Enter to save, Esc to cancel{showTags ? ', Enter/comma to add tags' : ''}
      </div>
    </div>
  );
}