"use client";
import { useMemo } from "react";
import { AlertTriangle, CheckCircle, Clock, Zap } from "lucide-react";

interface SchemaPreviewProps {
  parsed: any | null;
  error?: string;
  loading?: boolean;
}

export default function SchemaPreview({ parsed, error, loading = false }: SchemaPreviewProps) {
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  // Calculate behavior statistics
  const stats = useMemo(() => {
    if (!parsed?.sequence) return null;
    
    const sequence = parsed.sequence;
    const totalSteps = sequence.length;
    const blinkSteps = sequence.filter((step: any) => step.action === 'blink').length;
    const waitSteps = sequence.filter((step: any) => step.action === 'wait').length;
    
    // Calculate total estimated duration
    const totalDuration = sequence.reduce((acc: number, step: any) => {
      if (step.action === 'blink') {
        // Estimate: times * duration_ms * 2 (on + off cycles)
        return acc + (step.times * step.duration_ms * 2);
      } else if (step.action === 'wait') {
        return acc + step.duration_ms;
      }
      return acc;
    }, 0);
    
    return {
      totalSteps,
      blinkSteps,
      waitSteps,
      totalDuration,
      formattedDuration: formatDuration(totalDuration)
    };
  }, [parsed]);

  return (
    <div className="flex flex-col h-full" data-testid="dsl-preview">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-medium">Schema Preview</h3>
        {loading && (
          <div className="flex items-center gap-1 text-white/60">
            <Clock className="w-3 h-3 animate-pulse" />
            <span className="text-xs">Validating...</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-white/60">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 animate-spin" />
              <span className="text-sm">Parsing behavior...</span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="font-medium text-red-400">Validation Error</span>
            </div>
            <div className="text-sm text-red-300 whitespace-pre-wrap font-mono">
              {error}
            </div>
          </div>
        ) : parsed ? (
          <div className="space-y-4">
            {/* Success Header */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="font-medium text-green-400">Valid Behavior</span>
              </div>
              
              {/* Statistics */}
              {stats && (
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="text-center">
                    <div className="text-lg font-mono text-green-300">{stats.totalSteps}</div>
                    <div className="text-xs text-green-200">Total Steps</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-mono text-green-300">{stats.formattedDuration}</div>
                    <div className="text-xs text-green-200">Est. Duration</div>
                  </div>
                </div>
              )}
            </div>

            {/* Step Breakdown */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-white/80">Sequence Breakdown</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {parsed.sequence.map((step: any, index: number) => (
                  <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-white/10 rounded-full w-6 h-6 flex items-center justify-center text-xs font-mono">
                          {index + 1}
                        </span>
                        <span className="font-medium text-sm capitalize text-white/90">
                          {step.action}
                        </span>
                      </div>
                      {step.action === 'blink' && (
                        <Zap className="w-4 h-4 text-yellow-400" />
                      )}
                      {step.action === 'wait' && (
                        <Clock className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                    
                    <div className="text-xs text-white/70 space-y-1">
                      {step.action === 'blink' && (
                        <>
                          <div><span className="text-white/50">Pin:</span> {step.pin}</div>
                          <div><span className="text-white/50">Times:</span> {step.times}</div>
                          <div><span className="text-white/50">Duration:</span> {step.duration_ms}ms</div>
                          <div className="text-white/40">
                            Est. total: {step.times * step.duration_ms * 2}ms
                          </div>
                        </>
                      )}
                      {step.action === 'wait' && (
                        <div><span className="text-white/50">Duration:</span> {step.duration_ms}ms</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* JSON Structure (Collapsible) */}
            <details className="bg-white/5 rounded-lg border border-white/10">
              <summary className="p-3 cursor-pointer text-sm font-medium text-white/80 hover:text-white">
                Raw JSON Structure
              </summary>
              <pre className="p-3 text-xs font-mono text-white/70 overflow-auto border-t border-white/10">
                {JSON.stringify(parsed, null, 2)}
              </pre>
            </details>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-white/60">
            <div className="text-center">
              <div className="text-sm mb-1">Ready to validate</div>
              <div className="text-xs text-white/40">Enter YAML behavior to see preview</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}