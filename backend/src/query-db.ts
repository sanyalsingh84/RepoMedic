import prisma from "./db/prisma.js";

async function main() {
  const tickets = await prisma.ticket.findMany();
  console.log(JSON.stringify(tickets, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
