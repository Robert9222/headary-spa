export type SectionType =
  | 'hero'
  | 'rich-text'
  | 'two-column-lists'
  | 'list'
  | 'warning-list'
  | 'cta';

export type LocalizedString = { [lang: string]: string } | string | null;
export type LocalizedAny<T> = { [lang: string]: T | null } | T | null;

export interface PageSection {
  id: number;
  page_key: string;
  section_key: string;
  type: SectionType;
  order: number;
  is_active: boolean;
  image_url: string | null;
  title: LocalizedString;
  subtitle: LocalizedString;
  body: LocalizedString;
  content: LocalizedAny<any>;
  meta: { [key: string]: any } | null;
  created_at?: string;
  updated_at?: string;
}

/* Content shapes per type (for type-safety in templates/forms) */

export interface TwoColumnListsContent {
  leftHeading?: string;
  leftItems?: string[];
  rightHeading?: string;
  rightItems?: string[];
  note?: string;
}

export interface ListContent {
  items?: string[];
  footer?: string;
  tip?: string;
}

export interface WarningListItem {
  text: string;
  children?: string[];
}

export interface WarningListContent {
  items?: WarningListItem[];
  footer?: string;
}

