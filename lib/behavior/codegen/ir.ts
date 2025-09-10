// Intermediate Representation Types for Arduino Code Generation

export type IRPin = {
  label: string;    // e.g., "RED" or "LED_1" 
  pinId: string;    // e.g., "D13"
  pinNumber: number; // e.g., 13
};

export type IRAction = 
  | { kind: "blink"; pinId: string; times: number; durationMs: number }
  | { kind: "wait"; durationMs: number };

export type IRSketch = {
  boardFqbn: string;
  pins: IRPin[];           
  sequence: IRAction[];   
  loop: boolean;           // default false for now
};

// Code generation result types
export type CodeGenSuccess = {
  success: true;
  ir: IRSketch;
  code: string;
};

export type CodeGenError = {
  success: false;
  error: string;
  errorType: 'schema' | 'validation' | 'project' | 'template';
};

export type CodeGenResult = CodeGenSuccess | CodeGenError;

// Pin resolution types
export type PinReference = {
  source: string;      // Original reference from DSL
  resolved: IRPin;     // Resolved pin information
  resolvedVia: 'direct' | 'component'; // How it was resolved
};

// Error context for debugging
export type ValidationContext = {
  projectId: string;
  boardId?: string;
  availablePins: string[];
  componentAssignments: Array<{ componentId: string; label: string; pinId?: string; pins?: Record<string, string> }>;
};