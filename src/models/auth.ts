import { z } from "zod";

export const Auth = z.object({
    email: z.string().email(),
    password: z.string(),
});

export type Auth = z.infer<typeof Auth>;