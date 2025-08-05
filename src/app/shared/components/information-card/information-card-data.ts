/**
 * The full data model for the Information Card component.
 */
export interface InformationCardData {
  header: string;
  sections: InformationCardSection[];
}

/**
 * Represents a single label-value row within a section.
 */
export interface InformationCardRow {
  label: string;
  value: string | number; // Allowing for numbers as well
}

/**
 * Represents a single section within the card, with a header and its rows.
 */
export interface InformationCardSection {
  sectionHeader: string;
  rows: InformationCardRow[];
}
