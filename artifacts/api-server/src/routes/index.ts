import { Router, type IRouter } from "express";
import healthRouter from "./health";
import workersRouter from "./workers";
import contactsRouter from "./contacts";
import statsRouter from "./stats";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(adminRouter);
router.use(healthRouter);
router.use(workersRouter);
router.use(contactsRouter);
router.use(statsRouter);

export default router;
