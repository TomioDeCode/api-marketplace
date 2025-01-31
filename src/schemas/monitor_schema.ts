import { z } from "zod";

export const monitorCheckSchema = z.object({
  endpointId: z.string().uuid(),
});
