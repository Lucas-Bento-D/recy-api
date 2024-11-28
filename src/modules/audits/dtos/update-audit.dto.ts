import { z } from 'zod';

export const UpdateAuditSchema = z.object({
  audited: z.boolean(),
  auditorId: z.string().min(1, { message: 'auditorId cannot be empty' }),
  comments: z.string().optional(),
});

export type UpdateAuditDto = z.infer<typeof UpdateAuditSchema>;
