import { FastifyInstance } from "fastify";
import { pool } from "../db";
import { generateApiKey, hashValue } from "../utils/hash";


export default async function adminRoutes(app: FastifyInstance) {

  app.post("/clients", async (req: any) => {
    const { name, email } = req.body;
    const result = await pool.query(
      "INSERT INTO api_clients(name,email) VALUES($1,$2) RETURNING *",
      [name, email]
    );
    return result.rows[0];
  });

app.post("/api-keys", async (req: any, reply) => {
  const { client_id, daily_limit } = req.body;

  // 1️⃣ Check if client exists
  const clientCheck = await pool.query(
    "SELECT id FROM api_clients WHERE id = $1",
    [client_id]
  );

  if (clientCheck.rowCount === 0) {
    return reply.status(404).send({
      error: "Client not found. Cannot create API key."
    });
  }

  // 2️⃣ Generate & hash API key
  const rawApiKey = generateApiKey();
  const hashedKey = hashValue(rawApiKey);

  // 3️⃣ Insert API key
  const result = await pool.query(
    `INSERT INTO api_keys(client_id, api_key, daily_limit)
     VALUES($1,$2,$3)
     RETURNING id, client_id, daily_limit, created_at`,
    [client_id, hashedKey, daily_limit]
  );

  // 4️⃣ Return raw key only once
  return {
    ...result.rows[0],
    api_key: rawApiKey
  };
});


app.put("/disable", async (req: any, reply) => {
  const { api_key } = req.body;

  if (!api_key) {
    return reply.status(400).send({ error: "api_key is required" });
  }

  const hashedKey = hashValue(api_key);

  console.log("Disabling API key:", hashedKey);

  const result = await pool.query(
    `UPDATE api_keys
     SET is_active = false
     WHERE api_key = $1
     RETURNING id, is_active`,
    [hashedKey]
  );

  if (result.rowCount === 0) {
    return reply.status(404).send({ error: "API key not found" });
  }

  return {
    message: "API key disabled successfully",
    data: result.rows[0]
  };
});




  app.get("/usage/:clientId", async (req: any) => {
    const { clientId } = req.params;
    const result = await pool.query(
      `SELECT endpoint, COUNT(*), c.name as client_name
       FROM api_usage u
       JOIN api_keys k ON u.api_key_id = k.id
       JOIN api_clients c ON k.client_id = c.id
       WHERE k.client_id=$1
       GROUP BY u.endpoint, c.name`,
      [clientId]
    );
    return result.rows;
  });
}
