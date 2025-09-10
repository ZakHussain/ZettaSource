"use client";
import { AlertTriangle, XCircle } from "lucide-react";

interface PinConflictBannerProps {
  issues: {
    level: "error" | "warn" | "none";
    messages: string[];
  };
}

export default function PinConflictBanner({ issues }: PinConflictBannerProps) {
  if (issues.level === "none" || issues.messages.length === 0) {
    return null;
  }

  const isError = issues.level === "error";

  return (
    <div
      data-testid="conflict-banner"
      className={`
        card-base p-4 border-l-4 mb-4
        ${isError 
          ? 'border-red-400 bg-red-500/10' 
          : 'border-amber-400 bg-amber-500/10'
        }
      `}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          {isError ? (
            <XCircle className="w-5 h-5 text-red-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          )}
        </div>
        <div className="flex-1">
          <div className={`font-medium text-sm ${isError ? 'text-red-300' : 'text-amber-300'}`}>
            {isError ? 'Pin Assignment Errors' : 'Pin Assignment Warnings'}
          </div>
          <ul className={`text-sm mt-1 space-y-1 ${isError ? 'text-red-200' : 'text-amber-200'}`}>
            {issues.messages.map((message, index) => (
              <li key={index}>• {message}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}