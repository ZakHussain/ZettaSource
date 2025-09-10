import { ComponentKind, BoardPin, Assignment, Conflict, ComponentInstance } from "../types";

export function isCompatible(
  componentKind: ComponentKind, 
  pin: BoardPin, 
  role?: string
): boolean {
  switch (componentKind) {
    case "LED":
      return pin.caps.includes("DIGITAL");
    
    case "Button":
      return pin.caps.includes("DIGITAL");
    
    case "WS2812":
      return pin.caps.includes("DIGITAL");
    
    case "Buzzer":
      return pin.caps.includes("DIGITAL"); // PWM preferred but not required
    
    case "HCSR04":
      return pin.caps.includes("DIGITAL"); // Both trigger and echo need digital
    
    case "MPU6050":
      if (role === "sda") return pin.caps.includes("I2C_SDA");
      if (role === "scl") return pin.caps.includes("I2C_SCL");
      return pin.caps.includes("I2C_SDA") || pin.caps.includes("I2C_SCL");
    
    default:
      return false;
  }
}

export function getConflicts(
  assignments: Assignment[], 
  boardPins: BoardPin[], 
  components: ComponentInstance[]
): Conflict[] {
  const conflicts: Conflict[] = [];
  const pinUsage = new Map<string, Assignment[]>();
  
  // Group assignments by pin
  assignments.forEach(assignment => {
    if (assignment.pinId) {
      if (!pinUsage.has(assignment.pinId)) {
        pinUsage.set(assignment.pinId, []);
      }
      pinUsage.get(assignment.pinId)!.push(assignment);
    }
    
    if (assignment.pins) {
      Object.values(assignment.pins).forEach(pinId => {
        if (!pinUsage.has(pinId)) {
          pinUsage.set(pinId, []);
        }
        pinUsage.get(pinId)!.push(assignment);
      });
    }
  });
  
  // Check for pin conflicts
  pinUsage.forEach((assignmentList, pinId) => {
    if (assignmentList.length > 1) {
      const componentIds = assignmentList.map(a => a.componentId);
      const labels = componentIds
        .map(id => components.find(c => c.id === id)?.label || id)
        .join(", ");
      
      conflicts.push({
        level: "error",
        message: `Pin ${pinId} is used by multiple components: ${labels}`,
        componentIds,
        pinIds: [pinId]
      });
    }
  });
  
  // Check I2C bus compatibility
  const i2cAssignments = assignments.filter(a => {
    const component = components.find(c => c.id === a.componentId);
    return component?.kind === "MPU6050" && a.pins;
  });
  
  i2cAssignments.forEach(assignment => {
    if (assignment.pins) {
      const sdaPin = boardPins.find(p => p.id === assignment.pins!.sda);
      const sclPin = boardPins.find(p => p.id === assignment.pins!.scl);
      
      if (sdaPin && sclPin && sdaPin.bus !== sclPin.bus) {
        const component = components.find(c => c.id === assignment.componentId);
        conflicts.push({
          level: "error",
          message: `${component?.label || 'I2C component'} SDA and SCL pins must be on the same I2C bus`,
          componentIds: [assignment.componentId],
          pinIds: [assignment.pins.sda, assignment.pins.scl]
        });
      }
    }
  });
  
  return conflicts;
}

export function summarizeIssues(conflicts: Conflict[]): { level: "error" | "warn" | "none", messages: string[] } {
  if (conflicts.length === 0) return { level: "none", messages: [] };
  
  const hasErrors = conflicts.some(c => c.level === "error");
  const messages = conflicts.map(c => c.message);
  
  return {
    level: hasErrors ? "error" : "warn",
    messages
  };
}

export function getRequiredPinRoles(componentKind: ComponentKind): string[] {
  switch (componentKind) {
    case "HCSR04":
      return ["trigger", "echo"];
    case "MPU6050":
      return ["sda", "scl"];
    default:
      return [];
  }
}