import { FastifyInstance } from "fastify";
import { rateLimiter } from "../middleware/rateLimiter";
import { pool } from "../db";

export default async function apiRoutes(app: FastifyInstance) {
  app.get(
    "/data",
    { preHandler: rateLimiter },
    async (request: any) => {

      await pool.query(
        `INSERT INTO api_usage(api_key_id, endpoint, status_code)
         VALUES ($1, $2, $3)`,
        [request.apiKeyId, "/api/data", 200]
      );

      return { message: "Protected data accessed" };
    }
  );
}
