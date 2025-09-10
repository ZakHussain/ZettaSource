import { z } from "zod";

export const ComponentSchema = z.object({
  id: z.string(),
  kind: z.enum(["LED", "Button", "WS2812", "Buzzer", "HCSR04", "MPU6050"]),
  label: z.string().min(1, "Label is required").max(50, "Label too long"),
  params: z.record(z.any()).optional(),
});

export const AssignmentSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  componentId: z.string(),
  pinId: z.string().optional(),
  pins: z.record(z.string()).optional(),
});

export const ComponentCreateSchema = z.object({
  kind: z.enum(["LED", "Button", "WS2812", "Buzzer", "HCSR04", "MPU6050"]),
  label: z.string().min(1, "Label is required").max(50, "Label too long"),
  params: z.record(z.any()).optional(),
});