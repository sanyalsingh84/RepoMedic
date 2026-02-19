import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { env } from "../config/env.js";

export interface SourceFile {
  path: string;
  content: string;
}

export class RAGService {
  private rootDir: string;

  constructor() {
    try {
      // Reliable Git root detection
      this.rootDir = execSync("git rev-parse --show-toplevel", { encoding: "utf-8" }).trim();
    } catch (error) {
      console.warn("⚠️ Not in a git repository, falling back to parent directory.");
      this.rootDir = path.resolve(process.cwd(), "..");
    }
  }

  /**
   * Discover all git-tracked files that match our RAG criteria
   */
  public async discoverFiles(): Promise<string[]> {
    try {
      // Use -z to handle filenames with spaces/special characters safely
      const output = execSync("git ls-files -z", { cwd: this.rootDir }).toString();
      const allFiles = output.split("\0").map(f => f.trim()).filter(Boolean);

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
      console.error("❌ Failed to discover git files:", error);
      return [];
    }
  }

  /**
   * Read the content of a specific file with safety guardrails
   */
  public getFileContent(filePath: string): SourceFile | null {
    try {
      const fullPath = path.join(this.rootDir, filePath);
      if (!fs.existsSync(fullPath)) return null;

      // File Size Guardrail: Skip files larger than 50KB
      const stats = fs.statSync(fullPath);
      if (stats.size > 50_000) {
        console.warn(`⏩ Skipping large file: ${filePath} (${stats.size} bytes)`);
        return null;
      }
      
      const content = fs.readFileSync(fullPath, "utf-8");
      return { path: filePath, content };
    } catch (error) {
      console.error(`❌ Failed to read file ${filePath}:`, error);
      return null;
    }
  }
}

export const ragService = new RAGService();
