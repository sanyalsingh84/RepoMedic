export interface NormalizedTicket {
  summary: string;
  description: string;
  status: string;
  priority: string;
  projectKey: string;
  reporter: string;
  assignee: string | null;
  issueKey: string;
  source: string;
}

export interface FixSuggestion {
  diff: string;
  explanation?: string;
}

export interface AIAssistant {
  normalizeTicket(payload: any): Promise<NormalizedTicket>;
  generateFix(ticket: NormalizedTicket, contextFiles: { path: string; content: string }[]): Promise<FixSuggestion>;
  selectRelevantFiles(ticket: NormalizedTicket, filePaths: string[]): Promise<string[]>;
}
