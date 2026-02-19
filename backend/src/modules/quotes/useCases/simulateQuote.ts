type Typology = "T1" | "T2" | "T3";

const PRICE_TABLE: Record<Typology, number> = {
  T1: 1200000,
  T2: 1850000,
  T3: 2600000,
};

export function simulateQuote(typology: Typology) {
  const price = PRICE_TABLE[typology];

  if (!price) {
    throw new Error("Invalid typology");
  }

  return {
    typology,
    price,
    currency: "AOA",
    delivery_days: 21,
  };
}
