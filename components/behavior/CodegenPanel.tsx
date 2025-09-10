"use client";
import { useState } from "react";
import { codegenFromDsl } from "@/lib/behavior/codegen";
import { CodeGenResult } from "@/lib/behavior/codegen/ir";
import { Copy, RefreshCw, Zap, AlertTriangle, CheckCircle, Cpu } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="flex items-center gap-2 text-white/60">
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span>Loading editor...</span>
      </div>
    </div>
  )
});

interface CodegenPanelProps {
  projectId: string;
  dslText: string;
  onRegenerate?: () => void;
}

export default function CodegenPanel({ projectId, dslText, onRegenerate }: CodegenPanelProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CodeGenResult | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleRegenerate = async () => {
    setLoading(true);
    setResult(null);
    setCopySuccess(false);
    
    try {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const codeResult = codegenFromDsl(dslText, projectId);
      setResult(codeResult);
      onRegenerate?.();
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: 'template'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (result && result.success) {
      try {
        await navigator.clipboard.writeText(result.code);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (error) {
        console.error('Failed to copy code:', error);
      }
    }
  };

  const getErrorIcon = () => {
    if (!result || result.success) return null;
    
    switch (result.errorType) {
      case 'schema':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'validation':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'project':
        return <Cpu className="w-4 h-4 text-blue-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
    }
  };

  const getErrorTitle = () => {
    if (!result || result.success) return '';
    
    switch (result.errorType) {
      case 'schema':
        return 'DSL Schema Error';
      case 'validation':
        return 'Pin Validation Error';
      case 'project':
        return 'Project Configuration Error';
      case 'template':
        return 'Code Generation Error';
      default:
        return 'Generation Error';
    }
  };

  return (
    <div className="flex flex-col h-full" data-testid="codegen-panel">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          <h3 className="font-medium text-lg">Generated Arduino Code</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {result && result.success && (
            <button
              onClick={handleCopyCode}
              className={`p-2 rounded-lg transition ${
                copySuccess 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'hover:bg-white/10'
              }`}
              title="Copy code to clipboard"
            >
              {copySuccess ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          )}
          
          <button
            onClick={handleRegenerate}
            disabled={loading}
            data-testid="codegen-regenerate"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
              loading 
                ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300 cursor-wait'
                : 'bg-teal-400/20 border-teal-400/30 hover:bg-teal-400/30'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Generating...' : 'Regenerate'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {loading && (
          <div className="card-base p-8 flex items-center justify-center h-full">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-yellow-400" />
              <div className="text-lg font-medium mb-2">Generating Arduino Code</div>
              <div className="text-white/60">Processing DSL and building sketch...</div>
            </div>
          </div>
        )}

        {!loading && !result && (
          <div className="card-base p-8 flex items-center justify-center h-full">
            <div className="text-center">
              <Zap className="w-12 h-12 mx-auto mb-4 text-yellow-400/50" />
              <div className="text-lg font-medium mb-2">Ready to Generate</div>
              <div className="text-white/60 mb-4">Click "Regenerate" to create Arduino code from your DSL</div>
              <button
                onClick={handleRegenerate}
                className="px-4 py-2 rounded-lg bg-teal-400/20 hover:bg-teal-400/30 border border-teal-400/30 transition"
              >
                Generate Code
              </button>
            </div>
          </div>
        )}

        {!loading && result && !result.success && (
          <div 
            className="card-base p-6 bg-red-500/10 border-red-500/20"
            data-testid="codegen-error"
          >
            <div className="flex items-center gap-3 mb-4">
              {getErrorIcon()}
              <div className="font-medium text-red-400">{getErrorTitle()}</div>
            </div>
            <div className="text-red-300 text-sm whitespace-pre-wrap font-mono">
              {result.error}
            </div>
          </div>
        )}

        {!loading && result && result.success && (
          <div className="space-y-4">
            {/* Metadata */}
            <div className="card-base p-4 bg-green-500/10 border-green-500/20">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="font-medium text-green-400">Code Generated Successfully</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-white/60">Board FQBN:</div>
                  <div className="font-mono text-green-300">{result.ir.boardFqbn}</div>
                </div>
                <div>
                  <div className="text-white/60">Pins Used:</div>
                  <div className="font-mono text-green-300">
                    {result.ir.pins.length > 0 
                      ? result.ir.pins.map(p => p.pinId).join(', ')
                      : 'None'
                    }
                  </div>
                </div>
                <div>
                  <div className="text-white/60">Sequence Steps:</div>
                  <div className="font-mono text-green-300">{result.ir.sequence.length}</div>
                </div>
                <div>
                  <div className="text-white/60">Loop Mode:</div>
                  <div className="font-mono text-green-300">{result.ir.loop ? 'Yes' : 'One-time'}</div>
                </div>
              </div>
            </div>

            {/* Generated Code */}
            <div className="card-base p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-white/90">Arduino Sketch</h4>
                <div className="text-xs text-white/50">
                  {result.code.split('\n').length} lines
                </div>
              </div>
              
              <div 
                className="relative h-96 border border-white/10 rounded-lg overflow-hidden"
                data-testid="code-output"
              >
                <MonacoEditor
                  height="100%"
                  language="cpp"
                  theme="vs-dark"
                  value={result.code}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    lineNumbers: 'on',
                    wordWrap: 'on',
                    scrollBeyondLastLine: false,
                    fontSize: 13,
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", "Monaco", "Inconsolata", "Fira Code", "Fira Mono", "Droid Sans Mono", "Source Code Pro", monospace',
                    renderWhitespace: 'selection',
                    bracketPairColorization: { enabled: true },
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}