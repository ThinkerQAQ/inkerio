export interface ReadingCollection {
  label: string;
  title: string;
  href: string;
  groups: Array<{ label?: string; items: Array<{ href: string; title: string; current: boolean }> }>;
}
export interface ReadingLink { href: string; title: string }
