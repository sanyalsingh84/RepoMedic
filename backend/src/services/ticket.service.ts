import prisma from "../db/prisma.js";
import { aiAssistant } from "../ai/index.js";
import type { NormalizedTicket } from "../ai/index.js";
import { ragService } from "./rag.service.js";

export class TicketService {
  static async handleJiraWebhook(rawPayload: any) {
    // 1. Initial save of raw payload
    const issue = rawPayload.issue || {};
    const fields = issue.fields || {};

    let ticket = await prisma.ticket.create({
      data: {
        source: "jira",
        sourceIssueKey: issue.key || "UNKNOWN",
        summary: fields.summary || "No Summary",
        description: fields.description || "",
        status: fields.status?.name || "Open",
        priority: fields.priority?.name || "Medium",
        projectKey: fields.project?.key || "UNKNOWN",
        reporter: fields.reporter?.displayName || "Anonymous",
        assignee: fields.assignee?.displayName || "Unassigned",
        rawPayload: rawPayload,
        normalized: {}, 
      }
    });

    // 2. Perform AI Normalization
    let normalized: NormalizedTicket | null = null;
    try {
      normalized = await aiAssistant.normalizeTicket(rawPayload);
      
      // 3. Update ticket with normalized data
      ticket = await prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          normalized: normalized as any,
          summary: normalized.summary,
          description: normalized.description,
          status: normalized.status,
          priority: normalized.priority,
          assignee: normalized.assignee,
        }
      });

      console.log(`✅ Ticket ${ticket.sourceIssueKey} normalized by AI.`);
    } catch (error) {
      console.error(`❌ Normalization failed for ${ticket.sourceIssueKey}:`, error);
    }

    // 3. Perform RAG (File Discovery & Selection)
    if (normalized) {
      try {
        console.log(`🔍 Starting RAG for ${ticket.sourceIssueKey}...`);
        
        // Discover all relevant files in repo
        const allFiles = await ragService.discoverFiles();
        
        // Let AI select the top 3 most relevant ones
        const relevantFiles = await aiAssistant.selectRelevantFiles(normalized, allFiles);
        
        // Update ticket with relevant files
        ticket = await prisma.ticket.update({
          where: { id: ticket.id },
          data: { relevantFiles }
        });

        console.log(`✅ RAG complete for ${ticket.sourceIssueKey}. Found ${relevantFiles.length} relevant files.`);

        // 4. Generate Code Fix Suggestion
        if (relevantFiles.length > 0) {
          console.log(`🛠️ Generating suggestion for ${ticket.sourceIssueKey}...`);
          
          // Fetch actual content for the selected files
          const contextFiles = await Promise.all(
            relevantFiles.map(async (filePath) => {
              return await ragService.getFileContent(filePath);
            })
          );

          // Filter out files that couldn't be read (null)
          const validContext = contextFiles.filter((f): f is { path: string; content: string } => f !== null);

          if (validContext.length > 0) {
            const suggestion = await aiAssistant.generateFix(normalized, validContext);
            
            // Update ticket with the suggestion
            ticket = await prisma.ticket.update({
              where: { id: ticket.id },
              data: { suggestion: suggestion as any }
            });

            console.log(`✅ Suggestion generated for ${ticket.sourceIssueKey}.`);
          }
        }
      } catch (error) {
        console.error(`❌ RAG/Suggestion failed for ${ticket.sourceIssueKey}:`, error);
      }
    }

    return ticket;
  }
}
