import { ResidueType } from '@/modules/recycling-reports/dtos/residue-type.enum';
import { MaterialTotals } from '@/modules/recycling-reports/types';

export const formattedMaterialTotals = (
  materials: {
    materialType: ResidueType;
    weightKg: number;
  }[],
) => {
  const materialTotals: MaterialTotals = materials.reduce(
    (acc, { materialType, weightKg }) => {
      if (!acc[materialType]) {
        acc[materialType] = 0;
      }
      acc[materialType]! += weightKg; // Non-null assertion as it will be initialized
      return acc;
    },
    {} as MaterialTotals,
  );

  // Format the material totals to two decimal places
  const formattedMaterialTotals: { [key in ResidueType]?: number } = {};

  for (const [key, value] of Object.entries(materialTotals)) {
    formattedMaterialTotals[key as ResidueType] = parseFloat(value!.toFixed(2)); // Ensure value is not undefined
  }

  return formattedMaterialTotals;
};
