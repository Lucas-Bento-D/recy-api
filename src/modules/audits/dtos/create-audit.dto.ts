import { z } from 'zod';

export const CreateAuditSchema = z.object({
  reportId: z.string().min(1, { message: 'reportId cannot be empty' }),
  audited: z.boolean(),
  auditorId: z.string().min(1, { message: 'auditorId cannot be empty' }),
  comments: z.string().optional(),
});

export type CreateAuditDto = z.infer<typeof CreateAuditSchema>;
