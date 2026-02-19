import { app } from "./infra/http/app.ts";

export { app };

import { quotesRoutes } from "./modules/quotes/http/quotes.routes.js";

app.use("/quotes", quotesRoutes);
