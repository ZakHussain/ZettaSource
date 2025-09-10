"use client";
import { BoardPin, ComponentKind, Assignment } from "@/lib/types";
import { isCompatible } from "@/lib/logic/pinRules";

interface PinGridProps {
  pins: BoardPin[];
  assignments: Assignment[];
  assignMode?: {
    componentId: string;
    componentKind: ComponentKind;
    role?: string;
  };
  onPinClick: (pin: BoardPin) => void;
  getComponentLabel: (componentId: string) => string;
}

export default function PinGrid({ 
  pins, 
  assignments, 
  assignMode, 
  onPinClick, 
  getComponentLabel 
}: PinGridProps) {
  const getPinAssignment = (pinId: string) => {
    return assignments.find(a => 
      a.pinId === pinId || 
      (a.pins && Object.values(a.pins).includes(pinId))
    );
  };

  const isPinCompatible = (pin: BoardPin) => {
    if (!assignMode) return true;
    return isCompatible(assignMode.componentKind, pin, assignMode.role);
  };

  const getCapabilityColor = (cap: string) => {
    switch (cap) {
      case "DIGITAL": return "bg-blue-500/20 text-blue-300";
      case "ANALOG": return "bg-green-500/20 text-green-300";
      case "PWM": return "bg-purple-500/20 text-purple-300";
      case "I2C_SDA":
      case "I2C_SCL": return "bg-teal-500/20 text-teal-300";
      case "SPI_MISO":
      case "SPI_MOSI":
      case "SPI_SCK": return "bg-orange-500/20 text-orange-300";
      case "UART_TX":
      case "UART_RX": return "bg-red-500/20 text-red-300";
      default: return "bg-gray-500/20 text-gray-300";
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {pins.map(pin => {
        const assignment = getPinAssignment(pin.id);
        const isAssigned = !!assignment;
        const isCompatiblePin = isPinCompatible(pin);
        
        return (
          <button
            key={pin.id}
            data-testid={`pin-${pin.id}`}
            onClick={() => onPinClick(pin)}
            disabled={assignMode && !isCompatiblePin}
            className={`
              card-base p-3 text-left transition-all duration-200
              ${assignMode && !isCompatiblePin 
                ? 'opacity-40 cursor-not-allowed' 
                : 'hover:shadow-md hover:ring-1 hover:ring-teal hover:ring-opacity-40'
              }
              ${isAssigned 
                ? 'ring-1 ring-blue-400 ring-opacity-60 bg-blue-400/5' 
                : ''
              }
            `}
          >
            <div className="space-y-2">
              <div className="font-medium text-sm">{pin.displayName}</div>
              
              <div className="flex flex-wrap gap-1">
                {pin.caps.map(cap => (
                  <span
                    key={cap}
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${getCapabilityColor(cap)}`}
                  >
                    {cap.replace('_', '')}
                  </span>
                ))}
              </div>
              
              {isAssigned && assignment && (
                <div className="text-xs text-blue-300 font-medium truncate">
                  {getComponentLabel(assignment.componentId)}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}