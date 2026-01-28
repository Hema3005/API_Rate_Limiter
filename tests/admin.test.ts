import { app } from "../src/app";

beforeAll(async () => {
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe("Admin APIs", () => {
  let clientId: number;
  let apiKey: string;

  test("Create API client", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/admin/clients",
      payload: {
        name: "Admin Test Client",
        email: "admintest1@test.com"
      }
    });

    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.id).toBeDefined();

    clientId = body.id;
  });

  test("Create API key for client", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/admin/api-keys",
      payload: {
        client_id: clientId,
        daily_limit: 3
      }
    });

    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.api_key).toBeDefined();

    apiKey = body.api_key;
  });

  test("Get usage for client (should be empty initially)", async () => {
    const response = await app.inject({
      method: "GET",
      url: `/admin/usage/${clientId}`
    });

    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(body)).toBe(true);
  });

  test("Usage should increase after API call", async () => {
    // Call protected API once
    await app.inject({
      method: "GET",
      url: "/api/data",
      headers: {
        "x-api-key": apiKey
      }
    });

    // Fetch usage again
    const response = await app.inject({
      method: "GET",
      url: `/admin/usage/${clientId}`
    });

    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.length).toBeGreaterThan(0);
  });
});
