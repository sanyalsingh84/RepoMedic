import { Router } from "express";
import { TicketService } from "../services/ticket.service.js";

const router = Router();

router.post("/jira", async (req, res) => {
  try {
    const ticket = await TicketService.handleJiraWebhook(req.body);
    res.status(201).json(ticket);
  } catch (error) {
    console.error("❌ Webhook error:", error);
    res.status(500).json({ error: "Failed to process webhook" });
  }
});

export default router;
