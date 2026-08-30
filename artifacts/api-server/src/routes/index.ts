import { Router, type IRouter } from "express";
import healthRouter from "./health";
import studybridgeRouter from "./studybridge";

const router: IRouter = Router();

router.use(healthRouter);
router.use(studybridgeRouter);

export default router;
