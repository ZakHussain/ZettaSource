// Valid example 1: Simple LED blink sequence
export const EXAMPLE_SIMPLE_BLINK = `# Simple LED Blink Behavior
sequence:
  - action: blink
    pin: "D13"
    times: 5
    duration_ms: 500
  - action: wait
    duration_ms: 1000
  - action: blink
    pin: "D13"
    times: 3
    duration_ms: 200`;

// Valid example 2: Multi-LED pattern
export const EXAMPLE_MULTI_LED_PATTERN = `# Multi-LED Pattern Behavior
sequence:
  - action: blink
    pin: "D12"
    times: 2
    duration_ms: 300
  - action: blink
    pin: "D13"
    times: 2
    duration_ms: 300
  - action: wait
    duration_ms: 500
  - action: blink
    pin: "D12"
    times: 1
    duration_ms: 100
  - action: blink
    pin: "D13"
    times: 1
    duration_ms: 100
  - action: wait
    duration_ms: 2000`;

// Valid example 3: Long sequence with varied timing
export const EXAMPLE_COMPLEX_SEQUENCE = `# Complex Sequence Behavior
sequence:
  - action: blink
    pin: "LED_RED"
    times: 10
    duration_ms: 50
  - action: wait
    duration_ms: 1500
  - action: blink
    pin: "LED_GREEN"
    times: 3
    duration_ms: 800
  - action: blink
    pin: "LED_BLUE"
    times: 5
    duration_ms: 400
  - action: wait
    duration_ms: 3000`;

// Invalid example for testing error handling
export const EXAMPLE_INVALID = `# Invalid Example - Multiple Issues
sequence:
  - action: blink
    pin: ""  # Empty pin
    times: -1  # Negative times
    duration_ms: 0  # Zero duration
  - action: invalid_action  # Unknown action
    duration_ms: 500
  - action: wait
    # Missing duration_ms
  - action: blink
    # Missing required fields
    pin: "D13"`;

// Example with malformed YAML for parse error testing
export const EXAMPLE_MALFORMED_YAML = `# Malformed YAML Example
sequence:
  - action: blink
    pin: "D13"
    times: 5
    duration_ms: 500
  - action: wait
    duration_ms: 1000
      # Indentation error here
    extra_field: "invalid"`;

// Default example to use when creating new behaviors
export const DEFAULT_EXAMPLE = EXAMPLE_SIMPLE_BLINK;

// All examples for reference
export const ALL_EXAMPLES = {
  SIMPLE_BLINK: EXAMPLE_SIMPLE_BLINK,
  MULTI_LED_PATTERN: EXAMPLE_MULTI_LED_PATTERN,
  COMPLEX_SEQUENCE: EXAMPLE_COMPLEX_SEQUENCE,
  INVALID: EXAMPLE_INVALID,
  MALFORMED_YAML: EXAMPLE_MALFORMED_YAML
} as const;