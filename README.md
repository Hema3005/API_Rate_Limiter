# API Rate Limiter

A comprehensive API rate limiting solution built with Fastify and PostgreSQL. This system manages API client credentials, enforces daily request limits, and tracks API usage metrics.

## Features

- **Rate Limiting**: Enforce daily request limits per API key
- **Client Management**: Create and manage API clients
- **API Key Generation**: Secure API key generation with hashing
- **Usage Tracking**: Monitor API endpoint usage and request statistics
- **Admin Dashboard**: Administrative endpoints for managing clients and keys
- **Protected Endpoints**: Secure API routes with key-based authentication

## Tech Stack

- **Framework**: [Fastify](https://www.fastify.io/) v5.7.2
- **Database**: PostgreSQL with [pg](https://node-postgres.com/) driver
- **Language**: TypeScript
- **Testing**: Jest with Supertest
- **Runtime**: Node.js

## Project Structure

```
api-rate-limiter/
├── src/
│   ├── app.ts              # Fastify app configuration
│   ├── server.ts           # Server entry point
│   ├── db/
│   │   └── index.ts        # Database connection pool
│   ├── middleware/
│   │   └── rateLimiter.ts  # Rate limiting middleware
│   ├── routes/
│   │   ├── admin.ts        # Admin endpoints
│   │   └── api.ts          # Protected API endpoints
│   └── utils/
│       └── hash.ts         # Cryptographic utilities
├── tests/                  # Test suites
├── sql/
│   └── schema.sql          # Database schema
├── jest.config.js          # Jest configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

## Database Schema

### Tables

1. **api_clients**: Stores API client information
   - `id` (SERIAL PRIMARY KEY)
   - `name` (TEXT)
   - `email` (TEXT UNIQUE)
   - `created_at` (TIMESTAMP)

2. **api_keys**: Manages API keys and daily limits
   - `id` (SERIAL PRIMARY KEY)
   - `client_id` (INT FOREIGN KEY)
   - `api_key` (TEXT UNIQUE) - hashed key
   - `daily_limit` (INT) - default 1000 requests/day
   - `is_active` (BOOLEAN)
   - `created_at` (TIMESTAMP)

3. **api_rate_limits**: Tracks daily request counts
   - `api_key_id` (INT FOREIGN KEY)
   - `request_date` (DATE)
   - `request_count` (INT)
   - PRIMARY KEY: (api_key_id, request_date)

4. **api_usage**: Logs all API requests
   - `id` (SERIAL PRIMARY KEY)
   - `api_key_id` (INT FOREIGN KEY)
   - `endpoint` (TEXT)
   - `status_code` (INT)
   - `request_time` (TIMESTAMP)

## Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 12+

### Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd api-rate-limiter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL**
   - Create a PostgreSQL database
   - Run the schema: `psql -d <database_name> -f sql/schema.sql`

4. **Configure database connection**
   - Update `[src/db/index.ts](src/db/index.ts)` with your PostgreSQL credentials:
   ```typescript
   export const pool = new Pool({
     host: "localhost",
     user: "your-username",
     password: "your-password",
     database: "user_management",
     port: 5432,
   });
   ```

5. **Build TypeScript**
   ```bash
   npm run build
   ```

## Usage

### Development

Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

### Production

```bash
npm run build
npm start
```

## API Endpoints

### Admin Routes (`/admin`)

#### Create API Client
```bash
POST /admin/clients
Content-Type: application/json

{
  "name": "My Application",
  "email": "app@example.com"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "My Application",
  "email": "app@example.com",
  "created_at": "2026-01-28T10:00:00Z"
}
```

#### Create API Key
```bash
POST /admin/api-keys
Content-Type: application/json

{
  "client_id": 1,
  "daily_limit": 5000
}
```

**Response:**
```json
{
  "id": 1,
  "client_id": 1,
  "daily_limit": 5000,
  "api_key": "generated-api-key-here",
  "created_at": "2026-01-28T10:00:00Z"
}
```

#### Get Usage Statistics
```bash
GET /admin/usage/:clientId
```

**Response:**
```json
[
  {
    "endpoint": "/api/data",
    "count": 42,
    "client_name": "My Application"
  }
]
```

### Protected API Routes (`/api`)

#### Access Protected Data
```bash
GET /api/data
X-API-Key: your-api-key-here
```

**Success Response (200):**
```json
{
  "message": "Protected data accessed"
}
```

**Error Responses:**
- `401`: API key missing
- `403`: Invalid or inactive API key
- `429`: Rate limit exceeded for today

## Rate Limiting

The rate limiter works as follows:

1. Validates API key from `X-API-Key` header
2. Checks if key is active and valid
3. Queries daily request count for the current date
4. If request count >= daily_limit: returns 429 (Too Many Requests)
5. If count < daily_limit: increments counter and allows request

Daily limits reset automatically at midnight UTC.

## Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm run test:coverage
```

Coverage reports are available in the `coverage/` directory.

Test files:
- [tests/admin.test.ts](tests/admin.test.ts) - Admin endpoint tests
- [tests/api.test.ts](tests/api.test.ts) - Protected API endpoint tests

## Security

- **Key Hashing**: API keys are hashed using SHA-256 before storage in the database
- **One-Time Exposure**: Raw API keys are returned only once during creation; subsequent queries return the hashed version
- **Key Management**: Keys can be activated/deactivated for fine-grained access control
- **Audit Trail**: All API requests are logged in the `api_usage` table with timestamps and status codes
- **Rate Limiting**: Prevents abuse and DOS attacks by enforcing daily request limits per key
- **Database Security**: Consider implementing connection pooling limits and SSL/TLS for production

### Recommended for Production:
- Use environment variables for database credentials instead of hardcoding
- Implement API key rotation policies
- Enable PostgreSQL SSL/TLS connections
- Add input validation and sanitization
- Implement request signing/verification

## Error Handling

The system returns appropriate HTTP status codes:

- `200`: Successful request
- `401`: Missing authentication (API key)
- `403`: Forbidden (invalid or inactive key)
- `404`: Resource not found (client doesn't exist)
- `429`: Too many requests (rate limit exceeded)
- `500`: Server error

## Development

### Type Checking
```bash
npx tsc --noEmit
```

### Build
```bash
npm run build
```

Output is generated in the `dist/` directory.

### Utility Functions

The `[src/utils/hash.ts](src/utils/hash.ts)` module provides:
- `hashValue(value: string)`: Hash a value using SHA-256
- `generateApiKey()`: Generate a cryptographically secure random API key (32 bytes in hex format)


## Environment Variables

For production deployment, use environment variables:
```bash
DB_HOST=localhost
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=user_management
DB_PORT=5432
PORT=3000
NODE_ENV=production
```

## Troubleshooting

**Database Connection Error**
- Verify PostgreSQL is running
- Check database credentials in [src/db/index.ts](src/db/index.ts)
- Ensure the `user_management` database exists

**Rate Limit Not Working**
- Check that API key is properly hashed and stored
- Verify the date format is correct (YYYY-MM-DD)
- Ensure daily_limit is set on the API key

**Tests Failing**
- Ensure test database is properly set up
- Clear the rate limits table between test runs
- Check Node.js and PostgreSQL versions compatibility

## License

ISC

## Author

Hemamalini

---

For more information:
- [Fastify Documentation](https://www.fastify.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js pg Documentation](https://node-postgres.com/)