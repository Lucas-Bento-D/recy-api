import { z } from 'zod';

import { CreateRecyclingReportSchema } from './create-recycling-report.dto';

export const UpdateRecyclingReportSchema =
  CreateRecyclingReportSchema.partial();

export type UpdateRecyclingReportDto = z.infer<
  typeof UpdateRecyclingReportSchema
>;
