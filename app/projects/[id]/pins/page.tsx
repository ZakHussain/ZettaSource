"use client";
import { useParams } from "next/navigation";
import { useState, useMemo } from "react";

export const dynamic = 'force-dynamic';

import { useStore } from "@/lib/store";
import { getBoardPins } from "@/lib/boardPins";
import { boards } from "@/lib/mock";
import { ComponentKind, BoardPin } from "@/lib/types";
import { getConflicts, summarizeIssues, getRequiredPinRoles } from "@/lib/logic/pinRules";
import { calculatePowerBudget } from "@/lib/logic/power";

import SectionHeader from "@/components/SectionHeader";
import ComponentCatalog from "@/components/ComponentCatalog";
import ComponentForm from "@/components/ComponentForm";
import PinGrid from "@/components/PinGrid";
import PinAssignmentList from "@/components/PinAssignmentList";
import PinConflictBanner from "@/components/PinConflictBanner";
import PowerBudgetBadge from "@/components/PowerBudgetBadge";
import ComponentEditForm from "@/components/ComponentEditForm";

export default function PinMappingPage() {
  const { id: projectId } = useParams() as { id: string };
  const [selectedComponentKind, setSelectedComponentKind] = useState<ComponentKind | null>(null);
  const [editingComponentId, setEditingComponentId] = useState<string | null>(null);
  const [assignMode, setAssignMode] = useState<{
    componentId: string;
    componentKind: ComponentKind;
    role?: string;
    selectedPins?: Record<string, string>;
  } | null>(null);

  const project = useStore(s => s.projects.find(p => p.id === projectId));
  const addComponent = useStore(s => s.addComponent);
  const removeComponent = useStore(s => s.removeComponent);
  const updateComponent = useStore(s => s.updateComponent);
  const assignPin = useStore(s => s.assignPin);
  const assignPins = useStore(s => s.assignPins);
  const unassign = useStore(s => s.unassign);

  const components = project?.components || [];
  const assignments = project?.assignments || [];
  const boardPins = project?.boardId ? getBoardPins(project.boardId) : [];
  const board = project?.boardId ? boards.find(b => b.id === project.boardId) : null;

  const conflicts = useMemo(() => 
    getConflicts(assignments, boardPins, components), 
    [assignments, boardPins, components]
  );

  const issues = useMemo(() => 
    summarizeIssues(conflicts), 
    [conflicts]
  );

  const powerBudget = useMemo(() => 
    calculatePowerBudget(components), 
    [components]
  );

  if (!project) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-semibold mb-2">Project not found</h1>
        <p className="text-white/60">The project you're looking for doesn't exist.</p>
      </div>
    );
  }

  if (!project.boardId) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-semibold mb-2">No board selected</h1>
        <p className="text-white/60 mb-4">You need to select a board before mapping pins.</p>
        <a 
          href={`/projects/new?resume=${projectId}`}
          className="px-4 py-2 rounded-lg bg-teal/20 hover:bg-teal/30 border border-teal/30 transition"
        >
          Select Board
        </a>
      </div>
    );
  }

  const handleComponentSelect = (componentId: string) => {
    const component = components.find(c => c.id === componentId);
    if (!component) return;

    const requiredRoles = getRequiredPinRoles(component.kind);
    
    if (requiredRoles.length > 0) {
      // Multi-pin component
      setAssignMode({
        componentId,
        componentKind: component.kind,
        role: requiredRoles[0],
        selectedPins: {}
      });
    } else {
      // Single-pin component
      setAssignMode({
        componentId,
        componentKind: component.kind
      });
    }
  };

  const handlePinClick = (pin: BoardPin) => {
    if (!assignMode) return;

    const requiredRoles = getRequiredPinRoles(assignMode.componentKind);
    
    if (requiredRoles.length === 0) {
      // Single-pin assignment
      assignPin(projectId, assignMode.componentId, pin.id);
      setAssignMode(null);
    } else {
      // Multi-pin assignment
      const currentPins = assignMode.selectedPins || {};
      const nextPins = { ...currentPins, [assignMode.role!]: pin.id };
      
      if (Object.keys(nextPins).length === requiredRoles.length) {
        // All pins selected, complete assignment
        assignPins(projectId, assignMode.componentId, nextPins);
        setAssignMode(null);
      } else {
        // Continue to next role
        const currentRoleIndex = requiredRoles.indexOf(assignMode.role!);
        const nextRole = requiredRoles[currentRoleIndex + 1];
        setAssignMode({
          ...assignMode,
          role: nextRole,
          selectedPins: nextPins
        });
      }
    }
  };

  const handleUnassign = (componentId: string) => {
    unassign(projectId, componentId);
    if (assignMode?.componentId === componentId) {
      setAssignMode(null);
    }
  };

  const handleDelete = (componentId: string) => {
    removeComponent(projectId, componentId);
    if (assignMode?.componentId === componentId) {
      setAssignMode(null);
    }
  };

  const getComponentLabel = (componentId: string) => {
    const component = components.find(c => c.id === componentId);
    return component?.label || componentId;
  };

  const handleEdit = (componentId: string) => {
    setEditingComponentId(componentId);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Components & Pin Mapping"
        description={`Configure components for ${project.name} (${board?.name})`}
      >
        <PowerBudgetBadge {...powerBudget} />
      </SectionHeader>

      <PinConflictBanner issues={issues} />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column: Component Management */}
        <div className="space-y-6">
          <div className="card-base p-6">
            <h3 className="font-medium text-lg mb-4">Component Catalog</h3>
            <ComponentCatalog
              onSelect={setSelectedComponentKind}
              selected={selectedComponentKind}
            />
          </div>

          {selectedComponentKind && (
            <div className="card-base p-6">
              <h3 className="font-medium text-lg mb-4">Add {selectedComponentKind}</h3>
              <ComponentForm
                projectId={projectId}
                componentKind={selectedComponentKind}
                onSubmit={() => setSelectedComponentKind(null)}
              />
            </div>
          )}

          {editingComponentId && (
            <ComponentEditForm
              projectId={projectId}
              component={components.find(c => c.id === editingComponentId)!}
              onClose={() => setEditingComponentId(null)}
            />
          )}

          <div className="card-base p-6">
            <PinAssignmentList
              components={components}
              assignments={assignments}
              pins={boardPins}
              assignMode={assignMode}
              onComponentSelect={handleComponentSelect}
              onEdit={handleEdit}
              onUnassign={handleUnassign}
              onDelete={handleDelete}
            />
          </div>
        </div>

        {/* Right Column: Pin Grid */}
        <div className="space-y-6">
          <div className="card-base p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Pin Grid</h3>
              {assignMode && (
                <div className="text-sm text-teal-300">
                  Assigning {getComponentLabel(assignMode.componentId)}
                  {assignMode.role && ` (${assignMode.role.toUpperCase()})`}
                  <button
                    onClick={() => setAssignMode(null)}
                    className="ml-2 text-white/60 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            
            <PinGrid
              pins={boardPins}
              assignments={assignments}
              assignMode={assignMode}
              onPinClick={handlePinClick}
              getComponentLabel={getComponentLabel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}