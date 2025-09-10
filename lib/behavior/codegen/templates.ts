// Arduino Code Templates for Behavior DSL

import { IRSketch, IRPin, IRAction } from './ir';

/**
 * Generate Arduino sketch header with includes and FQBN comment
 */
export function generateHeader(boardFqbn: string): string {
  return `// Generated Arduino Sketch
// Board: ${boardFqbn}
// Auto-generated from ZettaSource Behavior DSL

`;
}

/**
 * Generate pin declarations section
 */
export function generatePinDeclarations(pins: IRPin[]): string {
  if (pins.length === 0) return '';
  
  const declarations = pins.map(pin => 
    `const int ${pin.label}_PIN = ${pin.pinNumber}; // ${pin.pinId}`
  ).join('\n');
  
  return `// Pin Definitions
${declarations}

`;
}

/**
 * Generate helper functions
 */
export function generateHelperFunctions(): string {
  return `// Helper Functions
void blinkPin(int pin, int times, int duration) {
  for (int i = 0; i < times; i++) {
    digitalWrite(pin, HIGH);
    delay(duration);
    digitalWrite(pin, LOW);
    delay(duration);
  }
}

`;
}

/**
 * Generate setup function with pinMode calls
 */
export function generateSetup(pins: IRPin[]): string {
  if (pins.length === 0) {
    return `void setup() {
  // No pins to initialize
}

`;
  }

  const pinModes = pins.map(pin => 
    `  pinMode(${pin.label}_PIN, OUTPUT);`
  ).join('\n');

  return `void setup() {
  // Initialize pins as outputs
${pinModes}
}

`;
}

/**
 * Generate sequence execution calls
 */
export function generateSequenceCalls(sequence: IRAction[], pins: IRPin[]): string {
  if (sequence.length === 0) {
    return '  // No sequence defined\n';
  }

  const calls = sequence.map(action => {
    switch (action.kind) {
      case 'blink':
        const pin = pins.find(p => p.pinId === action.pinId);
        if (!pin) {
          return `  // ERROR: Pin ${action.pinId} not found`;
        }
        return `  blinkPin(${pin.label}_PIN, ${action.times}, ${action.durationMs});`;
      
      case 'wait':
        return `  delay(${action.durationMs});`;
      
      default:
        return `  // ERROR: Unknown action type`;
    }
  }).join('\n');

  return calls + '\n';
}

/**
 * Generate main loop function
 */
export function generateLoop(sequence: IRAction[], pins: IRPin[], loopMode: boolean): string {
  const sequenceCalls = generateSequenceCalls(sequence, pins);
  
  if (loopMode) {
    return `void loop() {
  // Execute behavior sequence (looping)
${sequenceCalls}}
`;
  } else {
    return `void loop() {
  // Execute behavior sequence once
  static bool executed = false;
  if (!executed) {
${sequenceCalls}    executed = true;
  }
  // Behavior complete - enter idle state
  delay(1000);
}
`;
  }
}

/**
 * Generate complete Arduino sketch from IR
 */
export function generateArduinoSketch(ir: IRSketch): string {
  const header = generateHeader(ir.boardFqbn);
  const pinDeclarations = generatePinDeclarations(ir.pins);
  const helpers = generateHelperFunctions();
  const setup = generateSetup(ir.pins);
  const loop = generateLoop(ir.sequence, ir.pins, ir.loop);

  return header + pinDeclarations + helpers + setup + loop;
}