import { Router } from "express";
import asyncHandler from "./utils/asyncHandler.js";
import simulateController from "./controller.js";

const router = Router();

router.post("/simulate", asyncHandler(simulateController.simulate));

export default router;