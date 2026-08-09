export interface CommandDoc {
  name: string;
  syntax: string;
  description: string;
  options: { flag: string; description: string }[];
  // `output` is realistic sample terminal output for the example, shown in
  // its own block. Always English -- like the command itself, it's never
  // translated (see i18n/content/docs.ts).
  examples: { command: string; explanation: string; output?: string }[];
  tip: string;
  related: string[];
  advanced?: string;
  seeAlso?: string[]; // guide IDs this command relates to
}

export interface GuideDoc {
  id: string;
  title: string;
  category: 'fundamentals' | 'branching' | 'collaboration' | 'advanced';
  order: number;
  content: string; // markdown-like content with sections
  relatedCommands: string[];
}
