import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Project, ComponentInstance, Assignment } from "./types";

type UIState = { particlesEnabled: boolean };
type Store = {
  ui: UIState;
  projects: Project[];
  createProject: (p: { name: string; description?: string }) => string;
  selectBoard: (projectId: string, boardId: string) => void;
  setBehaviorDsl: (projectId: string, dsl: string) => void;
  toggleParticles: () => void;
  addComponent: (projectId: string, component: Omit<ComponentInstance, "id">) => string;
  removeComponent: (projectId: string, componentId: string) => void;
  assignPin: (projectId: string, componentId: string, pinId: string) => void;
  assignPins: (projectId: string, componentId: string, pins: Record<string, string>) => void;
  unassign: (projectId: string, componentId: string) => void;
  getAssignments: (projectId: string) => Assignment[];
  getComponents: (projectId: string) => ComponentInstance[];
};

export const useStore = create<Store>()(
  persist(
    (set) => ({
      ui: { particlesEnabled: true },
      projects: [],
      createProject: ({ name, description }) => {
        const id = crypto.randomUUID();
        const newP: Project = { id, name, description, createdAt: new Date().toISOString() };
        set(s => ({ projects: [newP, ...s.projects] }));
        return id;
      },
      selectBoard: (projectId, boardId) =>
        set(s => ({
          projects: s.projects.map(p => (p.id === projectId ? { ...p, boardId } : p))
        })),
      setBehaviorDsl: (projectId, dsl) =>
        set(s => ({
          projects: s.projects.map(p => 
            p.id === projectId ? { ...p, behaviorDsl: dsl } : p
          )
        })),
      toggleParticles: () => set(s => ({ ui: { particlesEnabled: !s.ui.particlesEnabled } })),
      addComponent: (projectId, component) => {
        const componentId = crypto.randomUUID();
        const newComponent: ComponentInstance = { ...component, id: componentId };
        set(s => ({
          projects: s.projects.map(p => 
            p.id === projectId 
              ? { ...p, components: [...(p.components || []), newComponent] }
              : p
          )
        }));
        return componentId;
      },
      removeComponent: (projectId, componentId) =>
        set(s => ({
          projects: s.projects.map(p =>
            p.id === projectId
              ? {
                  ...p,
                  components: (p.components || []).filter(c => c.id !== componentId),
                  assignments: (p.assignments || []).filter(a => a.componentId !== componentId)
                }
              : p
          )
        })),
      updateComponent: (projectId, componentId, updates) =>
        set(s => ({
          projects: s.projects.map(p =>
            p.id === projectId
              ? {
                  ...p,
                  components: (p.components || []).map(c =>
                    c.id === componentId ? { ...c, ...updates } : c
                  )
                }
              : p
          )
        })),
      assignPin: (projectId, componentId, pinId) =>
        set(s => ({
          projects: s.projects.map(p =>
            p.id === projectId
              ? {
                  ...p,
                  assignments: [
                    ...(p.assignments || []).filter(a => a.componentId !== componentId),
                    {
                      id: crypto.randomUUID(),
                      projectId,
                      componentId,
                      pinId
                    }
                  ]
                }
              : p
          )
        })),
      assignPins: (projectId, componentId, pins) =>
        set(s => ({
          projects: s.projects.map(p =>
            p.id === projectId
              ? {
                  ...p,
                  assignments: [
                    ...(p.assignments || []).filter(a => a.componentId !== componentId),
                    {
                      id: crypto.randomUUID(),
                      projectId,
                      componentId,
                      pins
                    }
                  ]
                }
              : p
          )
        })),
      unassign: (projectId, componentId) =>
        set(s => ({
          projects: s.projects.map(p =>
            p.id === projectId
              ? {
                  ...p,
                  assignments: (p.assignments || []).filter(a => a.componentId !== componentId)
                }
              : p
          )
        })),
      getAssignments: (projectId) => {
        const project = (window as any).__store?.getState?.()?.projects.find((p: Project) => p.id === projectId);
        return project?.assignments || [];
      },
      getComponents: (projectId) => {
        const project = (window as any).__store?.getState?.()?.projects.find((p: Project) => p.id === projectId);
        return project?.components || [];
      }
    }),
    { name: "zettasource-store" }
  )
);