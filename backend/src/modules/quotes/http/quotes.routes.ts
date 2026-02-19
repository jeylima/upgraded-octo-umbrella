import { Router } from "express";
import { simulateQuoteController } from "./simulateQuoteController.js";

export const quotesRoutes = Router();

quotesRoutes.post("/simulate", simulateQuoteController);
