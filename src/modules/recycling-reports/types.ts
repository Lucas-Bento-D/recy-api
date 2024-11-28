import { ResidueType } from './dtos/residue-type.enum';

export interface Metadata {
  attributes: { trait_type: string; value: string | undefined }[];
  description: string;
  name: string;
  image?: string | Buffer;
  [key: string]: unknown;
}

export type MaterialTotals = Record<ResidueType, number | undefined>;
