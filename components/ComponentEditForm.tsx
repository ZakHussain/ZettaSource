"use client";
import { useState } from "react";
import { ComponentInstance } from "@/lib/types";
import { ComponentCreateSchema } from "@/lib/schema";
import { useStore } from "@/lib/store";
import { X } from "lucide-react";

interface ComponentEditFormProps {
  projectId: string;
  component: ComponentInstance;
  onClose: () => void;
}

export default function ComponentEditForm({ projectId, component, onClose }: ComponentEditFormProps) {
  const [label, setLabel] = useState(component.label);
  const [params, setParams] = useState<Record<string, any>>(component.params || {});
  const [error, setError] = useState<string | null>(null);
  const updateComponent = useStore(s => s.updateComponent);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsed = ComponentCreateSchema.safeParse({
      kind: component.kind,
      label,
      params: Object.keys(params).length > 0 ? params : undefined
    });
    
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    
    updateComponent(projectId, component.id, {
      label,
      params: Object.keys(params).length > 0 ? params : undefined
    });
    
    setError(null);
    onClose();
  };

  const updateParam = (key: string, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const renderParams = () => {
    switch (component.kind) {
      case "LED":
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Color (optional)</label>
              <input
                type="text"
                value={params.color || ""}
                onChange={e => updateParam("color", e.target.value)}
                placeholder="Red, Blue, etc."
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
              />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="defaultState"
                  checked={params.defaultState !== "on"}
                  onChange={() => updateParam("defaultState", "off")}
                />
                Start OFF
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="defaultState"
                  checked={params.defaultState === "on"}
                  onChange={() => updateParam("defaultState", "on")}
                />
                Start ON
              </label>
            </div>
          </div>
        );
      
      case "WS2812":
        return (
          <div>
            <label className="block text-sm mb-1">Number of LEDs</label>
            <input
              type="number"
              min="1"
              value={params.count || ""}
              onChange={e => updateParam("count", parseInt(e.target.value) || 1)}
              placeholder="8"
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
              required
            />
            <p className="text-xs text-white/50 mt-1">Requires single data pin</p>
          </div>
        );
      
      case "Button":
        return (
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={params.pullup || false}
                onChange={e => updateParam("pullup", e.target.checked)}
              />
              Use internal pullup
            </label>
            <div>
              <label className="block text-sm mb-1">Debounce delay (ms)</label>
              <input
                type="number"
                min="0"
                value={params.debounce || ""}
                onChange={e => updateParam("debounce", parseInt(e.target.value) || 0)}
                placeholder="50"
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
              />
            </div>
          </div>
        );
      
      case "Buzzer":
        return (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={params.pwmPreferred || false}
              onChange={e => updateParam("pwmPreferred", e.target.checked)}
            />
            Prefer PWM pin (for tones)
          </label>
        );
      
      case "HCSR04":
        return (
          <p className="text-xs text-white/50">Requires two digital pins (Trigger + Echo)</p>
        );
      
      case "MPU6050":
        return (
          <p className="text-xs text-white/50">Requires I2C bus (SDA + SCL pins)</p>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="card-base p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-lg">Edit {component.kind}</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 transition"
          data-testid="close-edit-form"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" data-testid="component-edit-form">
        <div>
          <label htmlFor="edit-component-label" className="block text-sm mb-1 font-medium">
            Component Label
          </label>
          <input
            id="edit-component-label"
            data-testid="edit-component-label"
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="RED_LED, BlueBtn, etc."
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
            required
          />
        </div>
        
        {renderParams()}
        
        {error && (
          <div className="text-red-400 text-sm" role="alert">
            {error}
          </div>
        )}
        
        <div className="flex gap-3">
          <button
            type="submit"
            data-testid="component-update"
            className="px-4 py-2 rounded-lg bg-teal/20 hover:bg-teal/30 border border-teal/30 transition"
          >
            Update Component
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}