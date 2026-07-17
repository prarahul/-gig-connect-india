import { Router, type IRouter } from "express";
import { GetCommunityStatsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

// GET /stats
router.get("/stats", (_req, res): void => {
  // Keep the public dashboard resilient even if the database is not ready yet.
  const response = GetCommunityStatsResponse.parse({
    workersConnected: 25000,
    cities: 50,
    welfarePartners: 100,
    eventsOrganized: 200,
  });

  res.json(response);
});

export default router;
