import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import type { AIAssistant, NormalizedTicket, FixSuggestion } from "../assistant.interface.js";
import { env } from "../../config/env.js";

export class GeminiAssistant implements AIAssistant {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor() {
    if (!env.googleApiKey) {
      throw new Error("GOOGLE_GENAI_API_KEY is not defined in environment variables");
    }
    this.genAI = new GoogleGenerativeAI(env.googleApiKey);
    // Using gemini-1.5-flash for speed and efficiency in normalization
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
  }

  async normalizeTicket(payload: any): Promise<NormalizedTicket> {
    const prompt = `
      You are a backend assistant. Normalize the following Jira webhook payload into a stable JSON schema.
      
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

    const result = await this.model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    try {
      return JSON.parse(text) as NormalizedTicket;
    } catch (error) {
      console.error("Failed to parse Gemini response as JSON:", text);
      throw new Error("Invalid normalization response from AI");
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

    console.log(`🤖 Generating fix for ${ticket.issueKey} using Gemini...`);
    
    // For code generation, we use gemini-1.5-pro for better reasoning
    const proModel = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await proModel.generateContent(prompt);
    const text = result.response.text();

    return {
      diff: text.trim()
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
    `;

    const result = await this.model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    try {
      const selected = JSON.parse(text);
      return Array.isArray(selected) ? selected.slice(0, 3) : [];
    } catch (error) {
      console.error("Failed to parse Gemini file selection:", text);
      return [];
    }
  }
}
