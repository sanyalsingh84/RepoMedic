export interface RepositorySource {
  getTrackedFiles(): Promise<string[]>;
  getFileContent(filePath: string): Promise<string | null>;
}
