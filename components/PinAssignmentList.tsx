"use client";
import { ComponentInstance, Assignment, BoardPin } from "@/lib/types";
import { Trash2, Edit3 } from "lucide-react";

interface PinAssignmentListProps {
  components: ComponentInstance[];
  assignments: Assignment[];
  pins: BoardPin[];
  assignMode?: { componentId: string };
  onComponentSelect: (componentId: string) => void;
  onUnassign: (componentId: string) => void;
  onDelete: (componentId: string) => void;
  onEdit: (componentId: string) => void;
}

export default function PinAssignmentList({
  components,
  assignments,
  pins,
  assignMode,
  onComponentSelect,
  onUnassign,
  onDelete,
  onEdit
}: PinAssignmentListProps) {
  const getAssignmentInfo = (componentId: string) => {
    const assignment = assignments.find(a => a.componentId === componentId);
    if (!assignment) return "Not assigned";
    
    if (assignment.pinId) {
      const pin = pins.find(p => p.id === assignment.pinId);
      return pin?.displayName || assignment.pinId;
    }
    
    if (assignment.pins) {
      const pinNames = Object.entries(assignment.pins)
        .map(([role, pinId]) => {
          const pin = pins.find(p => p.id === pinId);
          return `${role.toUpperCase()}: ${pin?.displayName || pinId}`;
        });
      return pinNames.join(", ");
    }
    
    return "Not assigned";
  };

  if (components.length === 0) {
    return (
      <div className="card-base p-6 text-center">
        <p className="text-white/60">No components added yet</p>
        <p className="text-sm text-white/40">Select a component type to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="font-medium text-lg mb-3">Components & Assignments</h3>
      {components.map(component => {
        const assignment = assignments.find(a => a.componentId === component.id);
        const isSelected = assignMode?.componentId === component.id;
        
        return (
          <div
            key={component.id}
            data-testid={`assign-row-${component.id}`}
            className={`
              card-base p-4 transition-all duration-200
              ${isSelected 
                ? 'ring-2 ring-teal ring-opacity-60 bg-teal/5' 
                : 'hover:shadow-md hover:ring-1 hover:ring-teal hover:ring-opacity-40'
              }
            `}
          >
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => onComponentSelect(component.id)}
                className="flex-1 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="font-medium">{component.label}</div>
                    <div className="text-sm text-white/60">
                      {component.kind}
                      {component.params?.count && ` (${component.params.count})`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm ${assignment ? 'text-green-400' : 'text-white/60'}`}>
                      {getAssignmentInfo(component.id)}
                    </div>
                    {isSelected && (
                      <div className="text-xs text-teal-300 mt-1">
                        Click a pin to assign →
                      </div>
                    )}
                  </div>
                </div>
              </button>
              
              <div className="flex gap-1">
                <button
                  onClick={() => onEdit(component.id)}
                  className="p-2 rounded-lg hover:bg-white/10 transition"
                  title="Edit component"
                  data-testid={`edit-component-${component.id}`}
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                {assignment && (
                  <button
                    onClick={() => onUnassign(component.id)}
                    className="p-2 rounded-lg hover:bg-white/10 transition"
                    title="Unassign pins"
                  >
                    <span className="text-xs">Unassign</span>
                  </button>
                )}
                <button
                  onClick={() => onDelete(component.id)}
                  className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition"
                  title="Delete component"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}