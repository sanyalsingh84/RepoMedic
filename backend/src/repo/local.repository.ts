import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import type { RepositorySource } from "./repository.interface.js";

export class LocalRepository implements RepositorySource {
  private rootDir: string;

  constructor() {
    try {
      this.rootDir = execSync("git rev-parse --show-toplevel", { encoding: "utf-8" }).trim();
    } catch (error) {
      console.warn("⚠️ Not in a git repository, falling back to parent directory.");
      this.rootDir = path.resolve(process.cwd(), "..");
    }
  }

  async getTrackedFiles(): Promise<string[]> {
    try {
      const output = execSync("git ls-files -z", { cwd: this.rootDir }).toString();
      return output.split("\0").map(f => f.trim()).filter(Boolean);
    } catch (error) {
      console.error("❌ Failed to discover local git files:", error);
      return [];
    }
  }

  async getFileContent(filePath: string): Promise<string | null> {
    try {
      const fullPath = path.join(this.rootDir, filePath);
      if (!fs.existsSync(fullPath)) return null;

      const stats = fs.statSync(fullPath);
      if (stats.size > 50_000) return null; // Safety limit
      
      return fs.readFileSync(fullPath, "utf-8");
    } catch (error) {
      console.error(`❌ Failed to read local file ${filePath}:`, error);
      return null;
    }
  }
}
