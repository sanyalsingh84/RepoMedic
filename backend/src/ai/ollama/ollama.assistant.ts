import ollama from "ollama";
import type { AIAssistant, NormalizedTicket, FixSuggestion } from "../assistant.interface.js";
import { env } from "../../config/env.js";

export class OllamaAssistant implements AIAssistant {
  private model: string;

  constructor() {
    this.model = env.ollamaModel;
  }

  async normalizeTicket(payload: any): Promise<NormalizedTicket> {
    const prompt = `
      You are a backend assistant. Normalize the following Jira webhook payload into a stable JSON schema.
      Return ONLY valid JSON.
      
      Extract the following fields:
      - source (always "jira")
      - issueKey
      - summary
      - description
      - status
      - priority
      - projectKey
      - reporter
      - assignee (null if unassigned)

      Payload:
      ${JSON.stringify(payload, null, 2)}
    `;

    const response = await ollama.generate({
      model: this.model,
      prompt: prompt,
      stream: false,
      format: "json",
      options: {
        temperature: 0.1,
        top_p: 0.9
      }
    });

    try {
      return JSON.parse(response.response) as NormalizedTicket;
    } catch (error) {
      console.error("Failed to parse Ollama response as JSON:", response.response);
      throw new Error("Invalid normalization response from local AI");
    }
  }

  async generateFix(ticket: NormalizedTicket, contextFiles: { path: string; content: string }[]): Promise<FixSuggestion> {
    const fileSnippets = contextFiles
      .map(f => `File: ${f.path}\nContent:\n${f.content}\n---`)
      .join("\n\n");

    const prompt = `
      You are a senior software engineer. Provide a minimal, scoped code change suggestion to fix the following bug.
      Do not include unrelated refactors. Prefer diffs.

      Bug Report:
      - Summary: ${ticket.summary}
      - Description: ${ticket.description}

      Relevant Source Files:
      ${fileSnippets}

      Constraints:
      - Keep changes minimal
      - Human review required

      Output:
      - A unified diff (git-style)
      - No explanations
      - No markdown fences
      - No extra commentary
      - Only the diff
    `;

    console.log(`🤖 Generating fix for ${ticket.issueKey} using local AI...`);
    
    const response = await ollama.generate({
      model: this.model,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.1,
      }
    });

    return {
      diff: response.response.trim()
    };
  }

  async selectRelevantFiles(ticket: NormalizedTicket, filePaths: string[]): Promise<string[]> {
    const prompt = `
      You are a senior software engineer. Based on the following bug report, select the top 3 most relevant source files from the provided list that are likely to contain the cause of the bug or need modification.

      Bug Report:
      - Summary: ${ticket.summary}
      - Description: ${ticket.description}

      File List:
      ${filePaths.join("\n")}

      Return your selection as a JSON array of strings containing only the file paths.
      Example: ["src/app.ts", "src/services/user.service.ts"]
    `;

    console.log("🤖 Asking local AI to select relevant files...");
    const response = await ollama.generate({
      model: this.model,
      prompt: prompt,
      stream: false,
      format: "json",
      options: {
        temperature: 0.1,
      }
    });

    console.log("🤖 AI Response for file selection:", response.response);

    try {
      const selected = JSON.parse(response.response);
      let files: string[] = [];
      
      if (Array.isArray(selected)) {
        files = selected;
      } else if (selected && typeof selected === "object") {
        if (Array.isArray(selected.files)) {
          files = selected.files;
        } else if (Array.isArray(selected.mostRelevantFiles)) {
          files = selected.mostRelevantFiles;
        }
      }
      
      return files.slice(0, 3);
    } catch (error) {
      console.error("❌ Failed to parse Ollama file selection:", response.response);
      return [];
    }
  }
}
