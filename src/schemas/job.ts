import { z } from "zod";

import { JOB_DESCRIPTION_MAX } from "@/constants/job";

export const jobSnapshotSchema = z.object({
  title: z.string(),
  company: z.string(),
  rawText: z.string().max(JOB_DESCRIPTION_MAX, {
    message: "Descrição da vaga com no máximo 20.000 caracteres.",
  }),
});

export type JobSnapshot = z.infer<typeof jobSnapshotSchema>;
