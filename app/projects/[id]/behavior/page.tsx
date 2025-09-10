"use client";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useStore } from "@/lib/store";
import { DEFAULT_EXAMPLE } from "@/lib/behavior/examples";
import { validateBehavior } from "@/lib/behavior/schema";
import { Save, AlertTriangle, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import yaml from "js-yaml";
import BehaviorEditor from "@/components/behavior/BehaviorEditor";
import SchemaPreview from "@/components/behavior/SchemaPreview";
import CodegenPanel from "@/components/behavior/CodegenPanel";

export default function BehaviorEditorPage() {
  const { id: projectId } = useParams() as { id: string };
  const [dslText, setDslText] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isValidating, setIsValidating] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  
  const project = useStore(s => s.projects.find(p => p.id === projectId));
  const setBehaviorDsl = useStore(s => s.setBehaviorDsl);

  // Initialize DSL text from project or default example
  useEffect(() => {
    if (project) {
      const initialDsl = project.behaviorDsl || DEFAULT_EXAMPLE;
      setDslText(initialDsl);
    }
  }, [project?.behaviorDsl]);

  // Debounced validation to avoid excessive computation
  const debouncedValidate = useCallback((text: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    setIsValidating(true);
    debounceTimeoutRef.current = setTimeout(() => {
      setIsValidating(false);
    }, 300);
  }, []);

  // Handle DSL text changes with debounced validation
  const handleDslChange = useCallback((newValue: string) => {
    setDslText(newValue);
    debouncedValidate(newValue);
  }, [debouncedValidate]);

  // Parse and validate current DSL text
  const { validationResult, parsedData, parseError } = useMemo(() => {
    if (!dslText.trim()) {
      return { 
        validationResult: { type: "empty" as const },
        parsedData: null,
        parseError: undefined
      };
    }

    try {
      const parsed = yaml.load(dslText);
      const validation = validateBehavior(parsed);
      
      if (validation.success) {
        return {
          validationResult: { type: "valid" as const, data: validation.data },
          parsedData: validation.data,
          parseError: undefined
        };
      } else {
        return {
          validationResult: { type: "invalid" as const, errors: validation.errors },
          parsedData: null,
          parseError: validation.errors.join('\n')
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Invalid YAML syntax";
      return {
        validationResult: { 
          type: "yaml_error" as const, 
          error: errorMessage 
        },
        parsedData: null,
        parseError: errorMessage
      };
    }
  }, [dslText]);

  const handleSave = useCallback(async () => {
    if (!project) return;
    
    setSaveStatus("saving");
    try {
      setBehaviorDsl(projectId, dslText);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to save behavior DSL:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }, [project, projectId, dslText, setBehaviorDsl]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  if (!project) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-semibold mb-2">Project not found</h1>
        <p className="text-white/60">The project you're looking for doesn't exist.</p>
      </div>
    );
  }

  const getSaveButtonText = () => {
    switch (saveStatus) {
      case "saving": return "Saving...";
      case "saved": return "Saved!";
      case "error": return "Save Failed";
      default: return "Save Behavior";
    }
  };

  const getSaveButtonClass = () => {
    switch (saveStatus) {
      case "saving": return "bg-yellow-500/20 border-yellow-500/30 text-yellow-300 cursor-wait";
      case "saved": return "bg-green-500/20 border-green-500/30 text-green-300";
      case "error": return "bg-red-500/20 border-red-500/30 text-red-300";
      default: return "bg-teal-400/20 border-teal-400/30 hover:bg-teal-400/30 transition";
    }
  };

  const getValidationStatus = () => {
    switch (validationResult.type) {
      case "empty":
        return { icon: AlertTriangle, text: "Empty behavior", color: "text-white/60" };
      case "valid":
        return { icon: CheckCircle, text: "Valid behavior", color: "text-green-400" };
      case "invalid":
        return { icon: AlertTriangle, text: "Invalid behavior", color: "text-red-400" };
      case "yaml_error":
        return { icon: AlertTriangle, text: "YAML syntax error", color: "text-red-400" };
    }
  };

  const validationStatus = getValidationStatus();
  const ValidationIcon = validationStatus.icon;

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Back Navigation */}
      <div>
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Behavior Editor</h1>
          <p className="text-sm text-white/60 mt-1">
            Define LED behaviors for {project.name}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Validation Status */}
          <div className="flex items-center gap-2">
            <ValidationIcon className={`w-5 h-5 ${validationStatus.color}`} />
            <span className={`text-sm ${validationStatus.color}`}>
              {validationStatus.text}
            </span>
          </div>
          
          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${getSaveButtonClass()}`}
          >
            <Save className="w-4 h-4" />
            {getSaveButtonText()}
          </button>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-6 min-h-0">
        {/* Left Column - DSL Editor */}
        <div className="xl:col-span-1">
          <div className="card-base p-6 flex flex-col min-h-[400px] h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">DSL Editor</h2>
              <div className="text-sm text-white/60">
                Lines: {dslText.split('\n').length}
              </div>
            </div>
            
            {/* Behavior Editor */}
            <div className="flex-1 min-h-[300px] relative">
              <BehaviorEditor
                value={dslText}
                onChange={handleDslChange}
                errors={validationResult.type === "invalid" ? validationResult.errors : 
                       validationResult.type === "yaml_error" ? [validationResult.error] : []}
              />
            </div>
          </div>
        </div>

        {/* Middle Column - Schema Preview */}
        <div className="xl:col-span-1">
          <div className="card-base p-6 flex flex-col min-h-[400px] h-full">
            <div className="flex-1 min-h-0 overflow-auto">
              <SchemaPreview
                parsed={parsedData}
                error={parseError}
                loading={isValidating}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Code Generation */}
        <div className="xl:col-span-1">
          <div className="card-base p-6 flex flex-col min-h-[400px] h-full">
            <div className="flex-1 min-h-0 overflow-auto">
              <CodegenPanel
                projectId={projectId}
                dslText={dslText}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}