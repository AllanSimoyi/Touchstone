import { z } from "zod";

const AccessLevelSchema = z.enum(["Level 1", "Level 2", "Level 3", "Level 4", "Level 5"]);
export type AccessLevel = z.infer<typeof AccessLevelSchema>;