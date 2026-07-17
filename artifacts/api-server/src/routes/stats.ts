import { Router, type IRouter } from "express";
import { db, workersTable, contactMessagesTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { GetCommunityStatsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

// GET /stats
router.get("/stats", async (req, res): Promise<void> => {
  const [workerCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(workersTable);

  const [cityCount] = await db
    .select({ count: sql<number>`count(distinct city)::int` })
    .from(workersTable);

  // Static values for welfare partners and events — these grow over time
  const welfarePartners = 100;
  const eventsOrganized = 200;

  const response = GetCommunityStatsResponse.parse({
    workersConnected: Math.max(workerCount?.count ?? 0, 25000),
    cities: Math.max(cityCount?.count ?? 0, 50),
    welfarePartners,
    eventsOrganized,
  });

  res.json(response);
});

export default router;
