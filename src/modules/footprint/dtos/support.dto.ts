import { z } from 'zod';

export const SupportDtoSchema = z.object({
  email: z.string().email({ message: 'Email is required' }),
  companyType: z.string({
    message: 'companyType must be a string and should not be empty',
  }),
  employeesQuantity: z
    .number({ message: 'employeesQuantity must be a number' })
    .min(1, { message: 'employeesQuantity cannot be empty' }),
  wasteFootPrint: z
    .number({ message: 'wasteFootprint must be a number' })
    .min(1, { message: 'wasteFootprint cannot be empty' }),
});

export type SupportDto = z.infer<typeof SupportDtoSchema>;
