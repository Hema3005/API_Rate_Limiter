import Fastify from "fastify";
import adminRoutes from "./routes/admin";
import apiRoutes from "./routes/api";

export const app = Fastify();

app.register(adminRoutes, { prefix: "/admin" });
app.register(apiRoutes, { prefix: "/api" });
