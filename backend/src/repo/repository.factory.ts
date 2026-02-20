import { LocalRepository } from "./local.repository.js";
import { GitHubRepository } from "./github.repository.js";
import type { RepositorySource } from "./repository.interface.js";
import { env } from "../config/env.js";

const getRepository = (): RepositorySource => {
  if (env.repoMode === "github") {
    console.log("🌐 Using Remote Repository (GitHub)");
    return new GitHubRepository();
  }
  
  console.log("📂 Using Local Repository (Filesystem)");
  return new LocalRepository();
};

export const repository = getRepository();
