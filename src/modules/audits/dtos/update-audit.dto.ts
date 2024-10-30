import { z } from 'zod';

export const UpdateAuditSchema = z.object({
  audited: z.boolean(),
  comments: z.string(),
});

export type UpdateAuditDto = z.infer<typeof UpdateAuditSchema>;
