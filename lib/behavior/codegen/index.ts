// Core Code Generation Engine

import { Behavior } from '../schema';
import { IRSketch, IRPin, IRAction, CodeGenResult, PinReference, ValidationContext } from './ir';
import { generateArduinoSketch } from './templates';
import { validateBehavior } from '../schema';
import { useStore } from '../../store';
import { boards } from '../../mock';
import { getBoardPins } from '../../boardPins';
import yaml from 'js-yaml';

/**
 * Build Intermediate Representation from validated DSL and project context
 */
export function buildIR(behavior: Behavior, projectId: string): CodeGenResult {
  try {
    // Get project context
    const project = useStore.getState().projects.find(p => p.id === projectId);
    if (!project) {
      return {
        success: false,
        error: `Project ${projectId} not found`,
        errorType: 'project'
      };
    }

    // Validate board selection
    if (!project.boardId) {
      return {
        success: false,
        error: 'No board selected for this project. Please select a board first.',
        errorType: 'project'
      };
    }

    const board = boards.find(b => b.id === project.boardId);
    if (!board) {
      return {
        success: false,
        error: `Board ${project.boardId} not found in catalog`,
        errorType: 'project'
      };
    }

    const boardPins = getBoardPins(project.boardId);
    const components = project.components || [];
    const assignments = project.assignments || [];

    // Build validation context for error reporting
    const validationContext: ValidationContext = {
      projectId,
      boardId: project.boardId,
      availablePins: boardPins.map(p => p.id),
      componentAssignments: assignments.map(a => {
        const component = components.find(c => c.id === a.componentId);
        return {
          componentId: a.componentId,
          label: component?.label || a.componentId,
          pinId: a.pinId,
          pins: a.pins
        };
      })
    };

    // Resolve all pin references in the behavior sequence
    const pinReferences: Map<string, PinReference> = new Map();
    const resolveErrors: string[] = [];

    for (const step of behavior.sequence) {
      if (step.action === 'blink') {
        const pinRef = step.pin;
        
        if (!pinReferences.has(pinRef)) {
          const resolved = resolvePinReference(pinRef, validationContext);
          if (resolved.success) {
            pinReferences.set(pinRef, resolved.reference);
          } else {
            resolveErrors.push(resolved.error);
          }
        }
      }
    }

    // Return validation errors if any
    if (resolveErrors.length > 0) {
      return {
        success: false,
        error: resolveErrors.join('; '),
        errorType: 'validation'
      };
    }

    // Extract unique pins for IR
    const irPins: IRPin[] = Array.from(pinReferences.values()).map(ref => ref.resolved);

    // Convert DSL sequence to IR actions
    const irActions: IRAction[] = behavior.sequence.map(step => {
      if (step.action === 'blink') {
        return {
          kind: 'blink',
          pinId: step.pin, // Keep original reference for template resolution
          times: step.times,
          durationMs: step.duration_ms
        };
      } else if (step.action === 'wait') {
        return {
          kind: 'wait',
          durationMs: step.duration_ms
        };
      } else {
        throw new Error(`Unknown action: ${(step as any).action}`);
      }
    });

    // Build IR sketch
    const ir: IRSketch = {
      boardFqbn: board.fqbn,
      pins: irPins,
      sequence: irActions,
      loop: false // Default to one-time execution
    };

    // Generate Arduino code
    const code = generateArduinoSketch(ir);

    return {
      success: true,
      ir,
      code
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during code generation',
      errorType: 'template'
    };
  }
}

/**
 * Resolve a pin reference to an actual pin
 */
function resolvePinReference(
  pinRef: string, 
  context: ValidationContext
): { success: true; reference: PinReference } | { success: false; error: string } {
  
  // Strategy 1: Direct pin reference (e.g., "D13", "A0")
  if (context.availablePins.includes(pinRef)) {
    const boardPins = getBoardPins(context.boardId!);
    const boardPin = boardPins.find(p => p.id === pinRef);
    
    if (!boardPin) {
      return { success: false, error: `Pin ${pinRef} not found in board definition` };
    }

    // Validate pin capabilities for digital output (required for blink)
    if (!boardPin.caps.includes('DIGITAL')) {
      return { 
        success: false, 
        error: `Pin ${pinRef} does not support digital output (required for blink action)` 
      };
    }

    // Extract pin number from pin ID (e.g., "D13" -> 13, "A0" -> 14)
    const pinNumber = extractPinNumber(pinRef, boardPin.displayName);

    return {
      success: true,
      reference: {
        source: pinRef,
        resolved: {
          label: pinRef.replace(/[^a-zA-Z0-9]/g, '_'), // Safe C++ identifier
          pinId: pinRef,
          pinNumber
        },
        resolvedVia: 'direct'
      }
    };
  }

  // Strategy 2: Component label reference (e.g., "RED", "BUTTON_1")
  const assignment = context.componentAssignments.find(a => a.label === pinRef);
  if (assignment && assignment.pinId) {
    const boardPins = getBoardPins(context.boardId!);
    const boardPin = boardPins.find(p => p.id === assignment.pinId);
    
    if (!boardPin) {
      return { 
        success: false, 
        error: `Component ${pinRef} is assigned to pin ${assignment.pinId}, but this pin is not found on the board` 
      };
    }

    // Validate pin capabilities
    if (!boardPin.caps.includes('DIGITAL')) {
      return { 
        success: false, 
        error: `Component ${pinRef} is assigned to pin ${assignment.pinId} which does not support digital output` 
      };
    }

    const pinNumber = extractPinNumber(assignment.pinId, boardPin.displayName);

    return {
      success: true,
      reference: {
        source: pinRef,
        resolved: {
          label: pinRef.replace(/[^a-zA-Z0-9]/g, '_'), // Safe C++ identifier
          pinId: assignment.pinId,
          pinNumber
        },
        resolvedVia: 'component'
      }
    };
  }

  // No resolution found
  const availableComponents = context.componentAssignments
    .filter(a => a.pinId) // Only components with pin assignments
    .map(a => a.label);
  
  const suggestions = availableComponents.length > 0 
    ? ` Available component labels: ${availableComponents.join(', ')}`
    : ' No components with pin assignments found.';

  return { 
    success: false, 
    error: `Pin or component "${pinRef}" not found. Available pins: ${context.availablePins.join(', ')}.${suggestions}` 
  };
}

/**
 * Extract numeric pin number from pin ID
 */
function extractPinNumber(pinId: string, displayName: string): number {
  // Handle common Arduino pin formats
  if (pinId.startsWith('D')) {
    const num = parseInt(pinId.substring(1));
    return isNaN(num) ? 0 : num;
  }
  
  if (pinId.startsWith('A')) {
    // Analog pins typically start after digital pins
    // For Arduino Uno: A0 = pin 14, A1 = pin 15, etc.
    const num = parseInt(pinId.substring(1));
    return isNaN(num) ? 0 : 14 + num; // Common Arduino analog pin offset
  }

  if (pinId.startsWith('GPIO')) {
    // ESP32 GPIO pins
    const num = parseInt(pinId.substring(4));
    return isNaN(num) ? 0 : num;
  }

  // Fallback: try to parse any number from the string
  const match = pinId.match(/\d+/);
  return match ? parseInt(match[0]) : 0;
}

/**
 * Main entry point for DSL-to-Arduino code generation
 */
export function codegenFromDsl(dslText: string, projectId: string): CodeGenResult {
  try {
    // Parse DSL text
    let parsed: any;
    try {
      parsed = yaml.load(dslText);
    } catch (error) {
      return {
        success: false,
        error: `Failed to parse DSL: ${error instanceof Error ? error.message : 'Invalid YAML'}`,
        errorType: 'schema'
      };
    }

    // Validate parsed DSL
    const validation = validateBehavior(parsed);
    if (!validation.success) {
      return {
        success: false,
        error: `DSL validation failed: ${validation.error}`,
        errorType: 'schema'
      };
    }

    // Generate IR and code
    return buildIR(validation.data, projectId);
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during code generation',
      errorType: 'template'
    };
  }
}

/**
 * Validate that a behavior can be converted to code for a given project
 */
export function validateBehaviorForCodegen(behavior: Behavior, projectId: string): {
  isValid: boolean;
  errors: string[];
} {
  const result = buildIR(behavior, projectId);
  
  if (result.success) {
    return { isValid: true, errors: [] };
  } else {
    return { isValid: false, errors: [result.error] };
  }
}