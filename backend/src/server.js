import "dotenv/config";
import { query, healthCheck } from "./db.js";
import { createApp } from "./app.js";

const port = Number(process.env.PORT || 8081);
const allowedOrigin = process.env.CORS_ORIGIN || "*";

const app = createApp({ query, healthCheck, allowedOrigin });

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
