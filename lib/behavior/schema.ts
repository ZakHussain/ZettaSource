import { z } from "zod";

// Base action schema
const BaseActionSchema = z.object({
  action: z.string()
});

// Blink action schema
const BlinkActionSchema = BaseActionSchema.extend({
  action: z.literal("blink"),
  pin: z.string().min(1, "Pin is required"),
  times: z.number().int().positive("Times must be a positive integer"),
  duration_ms: z.number().int().positive("Duration must be a positive integer")
});

// Wait action schema  
const WaitActionSchema = BaseActionSchema.extend({
  action: z.literal("wait"),
  duration_ms: z.number().int().positive("Duration must be a positive integer")
});

// Union of all behavior step types
export const BehaviorStepSchema = z.union([
  BlinkActionSchema,
  WaitActionSchema
], {
  errorMap: (issue, ctx) => {
    if (issue.code === z.ZodIssueCode.invalid_union) {
      return { message: "Action must be either 'blink' or 'wait'" };
    }
    return { message: ctx.defaultError };
  }
});

// Main behavior schema
export const BehaviorSchema = z.object({
  sequence: z.array(BehaviorStepSchema)
    .min(1, "Sequence must contain at least one step")
});

// TypeScript types derived from schemas
export type BehaviorStep = z.infer<typeof BehaviorStepSchema>;
export type BlinkAction = z.infer<typeof BlinkActionSchema>;
export type WaitAction = z.infer<typeof WaitActionSchema>;
export type Behavior = z.infer<typeof BehaviorSchema>;

// Validation helper function
export function validateBehavior(data: unknown): { success: true; data: Behavior } | { success: false; errors: string[] } {
  const result = BehaviorSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error.errors.map(err => {
    const path = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
    return `${path}${err.message}`;
  });
  
  return { success: false, errors };
}