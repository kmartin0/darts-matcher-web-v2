export enum DartboardSectionArea {
  DOUBLE_BULL = 'DOUBLE_BULL',
  SINGLE_BULL = 'SINGLE_BULL',
  INNER_SINGLE = 'INNER_SINGLE',
  TRIPLE = 'TRIPLE',
  OUTER_SINGLE = 'OUTER_SINGLE',
  DOUBLE = 'DOUBLE',
  MISS = 'MISS'
}

/**
 * Gets the conventional prefix used to display a dartboard scoring area.
 *
 * @param area - Dartboard scoring area.
 * @returns Display prefix for the scoring area.
 */
export function getAreaPrefix(area: DartboardSectionArea): string {
  switch (area) {
    case DartboardSectionArea.TRIPLE:
      return 'T';

    case DartboardSectionArea.DOUBLE:
    case DartboardSectionArea.DOUBLE_BULL:
      return 'D';

    case DartboardSectionArea.SINGLE_BULL:
    case DartboardSectionArea.INNER_SINGLE:
    case DartboardSectionArea.OUTER_SINGLE:
    case DartboardSectionArea.MISS:
      return '';
  }
}
