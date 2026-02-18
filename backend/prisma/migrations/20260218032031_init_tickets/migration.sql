-- CreateTable
CREATE TABLE "Ticket" (
    "id" SERIAL NOT NULL,
    "source" TEXT NOT NULL,
    "sourceIssueKey" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "projectKey" TEXT NOT NULL,
    "reporter" TEXT NOT NULL,
    "assignee" TEXT,
    "rawPayload" JSONB NOT NULL,
    "normalized" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_sourceIssueKey_key" ON "Ticket"("sourceIssueKey");

-- CreateIndex
CREATE INDEX "Ticket_sourceIssueKey_idx" ON "Ticket"("sourceIssueKey");

-- CreateIndex
CREATE INDEX "Ticket_projectKey_idx" ON "Ticket"("projectKey");
