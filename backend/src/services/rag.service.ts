import path from "path";
import { env } from "../config/env.js";
import { repository } from "../repo/repository.factory.js";

export interface SourceFile {
  path: string;
  content: string;
}

export class RAGService {
  /**
   * Discover all files from the source that match our RAG criteria
   */
  public async discoverFiles(): Promise<string[]> {
    try {
      const allFiles = await repository.getTrackedFiles();

      // Filter by extension and exclude patterns
      return allFiles.filter(file => {
        const ext = path.extname(file);
        const isIncluded = env.ragExtensions.includes(ext);
        
        // Check if any part of the path is in the exclude list
        const pathSegments = file.split(/[\\/]/);
        const isExcluded = pathSegments.some(segment => env.ragExclude.includes(segment));
        
        return isIncluded && !isExcluded;
      });
    } catch (error) {
      console.error("❌ Failed to discover repository files:", error);
      return [];
    }
  }

  /**
   * Read the content of a specific file from the repository source
   */
  public async getFileContent(filePath: string): Promise<SourceFile | null> {
    try {
      const content = await repository.getFileContent(filePath);
      if (content === null) return null;
      
      return { path: filePath, content };
    } catch (error) {
      console.error(`❌ Failed to read file ${filePath}:`, error);
      return null;
    }
  }
}

export const ragService = new RAGService();
