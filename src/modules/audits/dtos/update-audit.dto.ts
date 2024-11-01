import { z } from 'zod';

export const UpdateAuditSchema = z.object({
  audited: z.boolean(),
  comments: z.string().nullable(),
});

export type UpdateAuditDto = z.infer<typeof UpdateAuditSchema>;
