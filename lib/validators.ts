import { z } from "zod";

export const ProjectCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().max(280, "Description too long").optional()
});