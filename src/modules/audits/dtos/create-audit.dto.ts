import { z } from 'zod';

export const CreateAuditSchema = z.object({
  reportId: z.string().min(1, { message: 'reportId cannot be empty' }),
  audited: z.boolean(),
  auditorId: z.string().nullable(),
  comments: z.string().optional(),
});

export type CreateAuditDto = z.infer<typeof CreateAuditSchema>;
