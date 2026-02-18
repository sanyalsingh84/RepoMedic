import { Router } from "express";
import prisma from "../db/prisma.js";

const router = Router();

router.post("/jira", async (req, res) => {
  try {
    const rawPayload = req.body;
    
    // For now, we'll just log and store the raw payload.
    // Normalization logic will come in Phase 2.
    
    // Minimal normalization for initial storage
    // Assuming Jira payload structure for now, but we'll improve this later.
    const issue = rawPayload.issue || {};
    const fields = issue.fields || {};
    
    const ticket = await prisma.ticket.create({
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
        normalized: {}, // To be filled by AI service later
      }
    });

    console.log(`✅ Ticket created: ${ticket.sourceIssueKey}`);
    res.status(201).json(ticket);
  } catch (error) {
    console.error("❌ Webhook error:", error);
    res.status(500).json({ error: "Failed to process webhook" });
  }
});

export default router;
