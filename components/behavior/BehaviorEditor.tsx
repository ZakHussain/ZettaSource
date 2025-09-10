"use client";
import { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="flex items-center gap-2 text-white/60">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Loading editor...</span>
      </div>
    </div>
  )
});

interface BehaviorEditorProps {
  value: string;
  onChange: (newValue: string) => void;
  errors?: string[];
}

export default function BehaviorEditor({ value, onChange, errors = [] }: BehaviorEditorProps) {
  const [isMonacoReady, setIsMonacoReady] = useState(false);
  const [useTextarea, setUseTextarea] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle textarea changes for fallback
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      // Force revalidation by triggering onChange with current value
      onChange(value);
    }
    
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Insert tab at cursor position
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      
      // Restore cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Auto-resize textarea on mount and value changes
  useEffect(() => {
    if (useTextarea && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value, useTextarea]);

  // Handle Monaco Editor configuration
  const handleEditorDidMount = (editor: any, monaco: any) => {
    setIsMonacoReady(true);
    
    // Configure YAML language
    monaco.languages.setLanguageConfiguration('yaml', {
      brackets: [['[', ']'], ['{', '}']],
      autoClosingPairs: [
        { open: '[', close: ']' },
        { open: '{', close: '}' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
      ],
      surroundingPairs: [
        { open: '[', close: ']' },
        { open: '{', close: '}' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
      ],
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onChange(editor.getValue());
    });

    // Set error markers if there are errors
    if (errors.length > 0) {
      const model = editor.getModel();
      const markers = errors.map((error, index) => ({
        severity: monaco.MarkerSeverity.Error,
        message: error,
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 1000,
      }));
      monaco.editor.setModelMarkers(model, 'yaml-validation', markers);
    }
  };

  // Handle editor loading error
  const handleEditorError = () => {
    console.warn('Monaco Editor failed to load, falling back to textarea');
    setUseTextarea(true);
  };

  return (
    <div className="flex flex-col h-full" data-testid="dsl-editor">
      <div className="flex-1 min-h-0 relative">
        {!useTextarea ? (
          <MonacoEditor
            height="100%"
            language="yaml"
            theme="vs-dark"
            value={value}
            onChange={(newValue) => onChange(newValue || '')}
            onMount={handleEditorDidMount}
            onError={handleEditorError}
            options={{
              minimap: { enabled: false },
              lineNumbers: 'on',
              wordWrap: 'on',
              automaticLayout: true,
              scrollBeyondLastLine: false,
              fontSize: 14,
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", "Monaco", "Inconsolata", "Fira Code", "Fira Mono", "Droid Sans Mono", "Source Code Pro", monospace',
              tabSize: 2,
              insertSpaces: true,
              renderWhitespace: 'boundary',
              bracketPairColorization: { enabled: true },
            }}
          />
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            className={`
              w-full h-full min-h-full p-4 rounded-lg resize-none
              bg-[#1e1e1e] text-white border border-white/10
              font-mono text-sm leading-relaxed
              focus:outline-none focus:border-teal-400/40
              ${errors.length > 0 ? 'border-red-400/60' : ''}
            `}
            placeholder="# Enter your behavior DSL here...
sequence:
  - action: blink
    pin: 'D13'
    times: 5
    duration_ms: 500"
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
          />
        )}
      </div>
      
      {/* Keyboard shortcuts hint */}
      <div className="text-xs text-white/50 mt-2 px-2">
        Press Ctrl+Enter to revalidate • Tab for indentation
      </div>
    </div>
  );
}