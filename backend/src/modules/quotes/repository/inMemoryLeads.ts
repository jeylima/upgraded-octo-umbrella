import { db } from "../../../database/connection.js";

export function createLead(typology: string) {
  const stmt = db.prepare(`
    INSERT INTO leads (typology)
    VALUES (?)
  `);

  stmt.run(typology);
}

export function listLeads() {
  const stmt = db.prepare(`
    SELECT * FROM leads
    ORDER BY created_at DESC
  `);

  return stmt.all();
}
