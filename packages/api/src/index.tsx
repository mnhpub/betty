import { Hono } from "hono";
import { cors } from "hono/cors";
import auth from "./routes/auth";
import groups from "./routes/groups";
import type { Bindings } from "./types";

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "http://localhost:8081"],
    credentials: true,
  }),
);

app.get("/health", (c) => c.json({ status: "ok" }));

app.get("/", (c) =>
  c.html(
    <html>
      <body>
        <h1>Betty API</h1>
      </body>
    </html>,
  ),
);

app.route("/auth", auth);
app.route("/groups", groups);

export default app;
