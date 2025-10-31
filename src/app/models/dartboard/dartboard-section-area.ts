export enum DartboardSectionArea {
  DOUBLE_BULL = 'DOUBLE_BULL',
  SINGLE_BULL = 'SINGLE_BULL',
  INNER_SINGLE = 'INNER_SINGLE',
  TRIPLE = 'TRIPLE',
  OUTER_SINGLE = 'OUTER_SINGLE',
  DOUBLE = 'DOUBLE',
  MISS = 'MISS'
}

export const DartboardSectionAreaToMultiplier: Record<DartboardSectionArea, number> = {
  [DartboardSectionArea.DOUBLE_BULL]: 2,
  [DartboardSectionArea.SINGLE_BULL]: 1,
  [DartboardSectionArea.INNER_SINGLE]: 1,
  [DartboardSectionArea.TRIPLE]: 3,
  [DartboardSectionArea.OUTER_SINGLE]: 1,
  [DartboardSectionArea.DOUBLE]: 2,
  [DartboardSectionArea.MISS]: 0,
};

export function getAreaPrefix(area: DartboardSectionArea): string {
  switch (area) {
    case DartboardSectionArea.DOUBLE:
    case DartboardSectionArea.DOUBLE_BULL:
      return 'D';
    case DartboardSectionArea.TRIPLE:
      return 'T';

    case DartboardSectionArea.INNER_SINGLE:
    case DartboardSectionArea.OUTER_SINGLE:
    case DartboardSectionArea.SINGLE_BULL:
    case DartboardSectionArea.MISS:
    default:
      return '';
  }
}
