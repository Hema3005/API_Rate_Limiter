import { pool } from "../db";
import { hashValue } from "../utils/hash";


export async function rateLimiter(request: any, reply: any) {
  const rawKey = request.headers["x-api-key"];
  const apiKey = hashValue(rawKey);

  if (!apiKey) {
    return reply.status(401).send({ error: "API key missing" });
  }

  const keyResult = await pool.query(
    "SELECT * FROM api_keys WHERE api_key=$1 AND is_active=true",
    [apiKey]
  );

  if (!keyResult.rows.length) {
    return reply.status(403).send({ error: "Invalid API key" });
  }

  const key = keyResult.rows[0];
  const today = new Date().toISOString().split("T")[0];

  const rateResult = await pool.query(
    `SELECT * FROM api_rate_limits 
     WHERE api_key_id=$1 AND request_date=$2`,
    [key.id, today]
  );

  if (rateResult.rows.length && rateResult.rows[0].request_count >= key.daily_limit) {
    return reply.status(429).send({ error: "Rate limit exceeded" });
  }

  if (rateResult.rows.length) {
    await pool.query(
      `UPDATE api_rate_limits 
       SET request_count = request_count + 1 
       WHERE api_key_id=$1 AND request_date=$2`,
      [key.id, today]
    );
  } else {
    await pool.query(
      `INSERT INTO api_rate_limits(api_key_id, request_date, request_count)
       VALUES ($1,$2,1)`,
      [key.id, today]
    );
  }

  request.apiKeyId = key.id;
}
