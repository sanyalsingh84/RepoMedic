import type { RepositorySource } from "./repository.interface.js";
import { env } from "../config/env.js";

export class GitHubRepository implements RepositorySource {
  private owner: string;
  private repo: string;
  private baseUrl: string;

  constructor() {
    if (!env.githubRepoUrl) {
      throw new Error("GITHUB_REPO_URL is required for GitHub mode");
    }
    
    // Improved URL parsing
    const cleaned = env.githubRepoUrl
      .replace("https://github.com/", "")
      .replace(".git", "")
      .replace(/\/$/, "");

    const [owner, repo] = cleaned.split("/");
    this.owner = owner || "";
    this.repo = repo || "";
    this.baseUrl = `https://api.github.com/repos/${this.owner}/${this.repo}`;
  }

  private async fetchGitHub(endpoint: string) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        ...(env.githubToken ? { Authorization: `token ${env.githubToken}` } : {}),
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "RepoMedic-App"
      },
    });

    if (response.status === 403) {
      throw new Error("GitHub API rate limit exceeded");
    }

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getTrackedFiles(): Promise<string[]> {
    try {
      // 1. Get repo metadata to find default branch
      const repoMeta = await this.fetchGitHub("") as any;
      const defaultBranch = repoMeta.default_branch || "main";

      // 2. Fetch the tree for the default branch
      const data = await this.fetchGitHub(`/git/trees/${defaultBranch}?recursive=1`) as any;
      
      const allFiles = data.tree
        .filter((item: any) => item.type === "blob")
        .map((item: any) => item.path);

      // 3. Apply extensions and exclude filters (Pattern Consistency)
      return allFiles.filter((file: string) => {
        const ext = `.${file.split('.').pop()}`;
        const isIncluded = env.ragExtensions.includes(ext);
        
        const pathSegments = file.split(/[\\/]/);
        const isExcluded = pathSegments.some(segment => env.ragExclude.includes(segment));
        
        return isIncluded && !isExcluded;
      });
    } catch (error) {
      console.error("❌ Failed to fetch GitHub file tree:", error);
      return [];
    }
  }

  async getFileContent(filePath: string): Promise<string | null> {
    try {
      const data = await this.fetchGitHub(`/contents/${filePath}`) as any;
      
      // GitHub Mode size guard (50KB)
      if (data.size > 50_000) {
        console.warn(`⏩ Skipping large GitHub file: ${filePath} (${data.size} bytes)`);
        return null;
      }

      if (data.encoding === "base64") {
        return Buffer.from(data.content, "base64").toString("utf-8");
      }
      return data.content || null;
    } catch (error) {
      console.error(`❌ Failed to fetch GitHub file content ${filePath}:`, error);
      return null;
    }
  }
}
