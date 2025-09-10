"use client";
import { ComponentKind } from "@/lib/types";
import { Zap, Hand, Lightbulb, Volume2, Radar, Gauge } from "lucide-react";

interface ComponentCatalogProps {
  onSelect: (kind: ComponentKind) => void;
  selected?: ComponentKind;
}

const COMPONENTS = [
  {
    kind: "LED" as ComponentKind,
    name: "LED",
    description: "Light Emitting Diode",
    icon: Lightbulb,
    color: "text-yellow-400"
  },
  {
    kind: "Button" as ComponentKind,
    name: "Button",
    description: "Push Button Switch",
    icon: Hand,
    color: "text-blue-400"
  },
  {
    kind: "WS2812" as ComponentKind,
    name: "WS2812",
    description: "RGB LED Strip (NeoPixel)",
    icon: Zap,
    color: "text-purple-400"
  },
  {
    kind: "Buzzer" as ComponentKind,
    name: "Buzzer",
    description: "Piezo Buzzer",
    icon: Volume2,
    color: "text-orange-400"
  },
  {
    kind: "HCSR04" as ComponentKind,
    name: "HC-SR04",
    description: "Ultrasonic Distance Sensor",
    icon: Radar,
    color: "text-green-400"
  },
  {
    kind: "MPU6050" as ComponentKind,
    name: "MPU6050",
    description: "6-Axis IMU Sensor",
    icon: Gauge,
    color: "text-teal-400"
  }
];

export default function ComponentCatalog({ onSelect, selected }: ComponentCatalogProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {COMPONENTS.map(({ kind, name, description, icon: Icon, color }) => (
        <button
          key={kind}
          data-testid={`catalog-card-${kind}`}
          onClick={() => onSelect(kind)}
          className={`
            card-base p-4 text-left transition-all duration-200
            hover:shadow-lg hover:ring-1 hover:ring-teal hover:ring-opacity-40
            ${selected === kind 
              ? 'ring-2 ring-teal ring-opacity-60 bg-teal/5' 
              : 'hover:bg-white/5'
            }
          `}
        >
          <div className="flex flex-col gap-2">
            <Icon className={`w-6 h-6 ${color}`} />
            <div>
              <div className="font-medium text-sm">{name}</div>
              <div className="text-xs text-white/60">{description}</div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}