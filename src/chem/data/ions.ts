export interface Ion { name: string; formula: string; charge: number }

export const COMMON_IONS: Ion[] = [
  { name: 'natri', formula: 'Na', charge: 1 }, { name: 'kali', formula: 'K', charge: 1 },
  { name: 'canxi', formula: 'Ca', charge: 2 }, { name: 'magiê', formula: 'Mg', charge: 2 },
  { name: 'nhôm', formula: 'Al', charge: 3 }, { name: 'kẽm', formula: 'Zn', charge: 2 },
  { name: 'đồng (II)', formula: 'Cu', charge: 2 }, { name: 'sắt (II)', formula: 'Fe', charge: 2 },
  { name: 'sắt (III)', formula: 'Fe', charge: 3 }, { name: 'bạc', formula: 'Ag', charge: 1 },
  { name: 'amoni', formula: 'NH4', charge: 1 }, { name: 'hiđro', formula: 'H', charge: 1 },
  { name: 'clorua', formula: 'Cl', charge: -1 },
  { name: 'bromua', formula: 'Br', charge: -1 }, { name: 'iotua', formula: 'I', charge: -1 }, { name: 'nitrat', formula: 'NO3', charge: -1 },
  { name: 'sunfat', formula: 'SO4', charge: -2 }, { name: 'sunfit', formula: 'SO3', charge: -2 },
  { name: 'cacbonat', formula: 'CO3', charge: -2 }, { name: 'photphat', formula: 'PO4', charge: -3 },
  { name: 'hiđroxit', formula: 'OH', charge: -1 }, { name: 'cacbonat hiđro', formula: 'HCO3', charge: -1 },
]

export function ionCharge(formula: string): number | undefined {
  return COMMON_IONS.find(i => i.formula === formula)?.charge
}
