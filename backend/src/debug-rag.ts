import { execSync } from "child_process";
import path from "path";
import { env } from "./config/env.js";

async function debug() {
  const rootDir = path.resolve(process.cwd(), "..");
  const output = execSync("git ls-files", { cwd: rootDir }).toString();
  const allFiles = output.split(/\r?\n/).map(f => f.trim()).filter(Boolean);

  allFiles.forEach(file => {
    const ext = path.extname(file);
    const isIncluded = env.ragExtensions.includes(ext);
    
    const pathSegments = file.split(/[\\/]/);
    const isExcluded = pathSegments.some(segment => env.ragExclude.includes(segment));
    
    if (file.includes("route")) {
        console.log(`Checking: ${file} (ext: ${ext}, included: ${isIncluded}, excluded: ${isExcluded}, segments: ${JSON.stringify(pathSegments)})`);
    }
  });
}

debug();
