import { Hono } from "hono";
import { requireUser, type Env } from "../lib/session";

const groups = new Hono<Env>();

const GROUP_ROW_SELECT = `
  SELECT
    g.id,
    g.name,
    gt.name AS type,
    g.status,
    (SELECT COUNT(*) FROM group_members gm
       WHERE gm.group_id = g.id AND gm.status = 'active' AND gm.left_at IS NULL) AS member_count,
    (SELECT u.name FROM group_members gm
       JOIN group_roles gr ON gr.id = gm.role_id
       JOIN users u ON u.id = gm.user_id
       WHERE gm.group_id = g.id AND gr.name = 'Leader' AND gm.status = 'active' AND gm.left_at IS NULL
       LIMIT 1) AS leader
  FROM groups g
  JOIN group_types gt ON gt.id = g.group_type_id
`;

groups.get("/", requireUser, async (c) => {
  const { results } = await c.env.DB.prepare(`${GROUP_ROW_SELECT} ORDER BY g.created_at DESC`).all();
  return c.json(results);
});

groups.get("/types", requireUser, async (c) => {
  const { results } = await c.env.DB.prepare("SELECT id, name FROM group_types ORDER BY name").all();
  return c.json(results);
});

groups.post("/", requireUser, async (c) => {
  const body = await c.req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const groupTypeId = typeof body?.groupTypeId === "string" ? body.groupTypeId : "";

  if (!name || !groupTypeId) {
    return c.json({ error: "name and groupTypeId are required" }, 400);
  }

  const leaderRole = await c.env.DB.prepare(
    "SELECT id FROM group_roles WHERE group_type_id = ? AND name = 'Leader'",
  )
    .bind(groupTypeId)
    .first<{ id: string }>();
  if (!leaderRole) {
    return c.json({ error: "unknown groupTypeId" }, 400);
  }

  const groupId = crypto.randomUUID();
  await c.env.DB.batch([
    c.env.DB.prepare("INSERT INTO groups (id, group_type_id, name) VALUES (?, ?, ?)").bind(
      groupId,
      groupTypeId,
      name,
    ),
    c.env.DB.prepare(
      "INSERT INTO group_members (id, user_id, group_id, role_id) VALUES (?, ?, ?, ?)",
    ).bind(crypto.randomUUID(), c.get("userId"), groupId, leaderRole.id),
  ]);

  const created = await c.env.DB.prepare(`${GROUP_ROW_SELECT} WHERE g.id = ?`).bind(groupId).first();
  return c.json(created, 201);
});

export default groups;
