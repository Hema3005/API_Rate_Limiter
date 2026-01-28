import { app } from "../src/app";

beforeAll(async () => {
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe("API Rate Limiter", () => {
  let apiKey: string;
  let clientId: number;

  it("creates client", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/admin/clients",
      payload: {
        name: "Test Client",
        email: "tests@test.com"
      }
    });

    const body = res.json();
    expect(res.statusCode).toBe(200);
    clientId = body.id;
  });

  it("creates api key", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/admin/api-keys",
      payload: {
        client_id: clientId,
        daily_limit: 2
      }
    });

    const body = res.json();
    apiKey = body.api_key;
    expect(apiKey).toBeDefined();
  });

  it("access protected api", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/data",
      headers: {
        "x-api-key": apiKey
      }
    });

    expect(res.statusCode).toBe(200);
  });

  it("rate limit exceeded", async () => {
    await app.inject({
      method: "GET",
      url: "/api/data",
      headers: { "x-api-key": apiKey }
    });

    const res = await app.inject({
      method: "GET",
      url: "/api/data",
      headers: { "x-api-key": apiKey }
    });

    expect(res.statusCode).toBe(429);
  });
});
