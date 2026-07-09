import { Hono } from "hono";

const app = new Hono();

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

export default {
  port: process.env.PORT ? Number(process.env.PORT) : 4000,
  fetch: app.fetch,
};
