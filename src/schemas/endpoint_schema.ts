import { z } from "zod";

export const endpointSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  checkInterval: z.number().min(60000).max(86400000).optional(),
  timeout: z.number().min(1000).max(30000).optional(),
});
