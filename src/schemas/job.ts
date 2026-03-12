import { z } from "zod";

export const jobSnapshotSchema = z.object({
  title: z.string(),
  company: z.string(),
});

export type JobSnapshot = z.infer<typeof jobSnapshotSchema>;
