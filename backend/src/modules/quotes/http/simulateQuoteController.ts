import { Request, Response } from "express";
import { simulateQuote } from "../useCases/simulateQuote.js";

export async function simulateQuoteController(req: Request, res: Response) {
  try {
    const { typology } = req.body;

    const result = simulateQuote(typology);

    return res.json(result);
  } catch (err) {
    return res.status(400).json({ error: "Invalid typology" });
  }
}
