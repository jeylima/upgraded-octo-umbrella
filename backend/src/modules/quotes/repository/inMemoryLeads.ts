type Lead = {
  id: string;
  typology: string;
  created_at: Date;
};

export const leads: Lead[] = [];

export function createLead(typology: string) {
  const lead = {
    id: crypto.randomUUID(),
    typology,
    created_at: new Date(),
  };

  leads.push(lead);
  return lead;
}
