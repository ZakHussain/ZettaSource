"use client";
import { useState } from "react";
import { ComponentKind } from "@/lib/types";
import { ComponentCreateSchema } from "@/lib/schema";
import { useStore } from "@/lib/store";

interface ComponentFormProps {
  projectId: string;
  componentKind: ComponentKind;
  onSubmit?: () => void;
}

export default function ComponentForm({ projectId, componentKind, onSubmit }: ComponentFormProps) {
  const [label, setLabel] = useState("");
  const [params, setParams] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);
  const addComponent = useStore(s => s.addComponent);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsed = ComponentCreateSchema.safeParse({
      kind: componentKind,
      label,
      params: Object.keys(params).length > 0 ? params : undefined
    });
    
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    
    addComponent(projectId, parsed.data);
    setError(null);
    setLabel("");
    setParams({});
    onSubmit?.();
  };

  const updateParam = (key: string, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const renderParams = () => {
    switch (componentKind) {
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
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="component-form">
      <div>
        <label htmlFor="component-label" className="block text-sm mb-1 font-medium">
          Component Label
        </label>
        <input
          id="component-label"
          data-testid="component-label"
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
      
      <button
        type="submit"
        data-testid="component-submit"
        className="px-4 py-2 rounded-lg bg-teal/20 hover:bg-teal/30 border border-teal/30 transition"
      >
        Add Component
      </button>
    </form>
  );
}