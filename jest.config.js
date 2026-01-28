module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/server.ts",        // exclude bootstrap
    "!src/db/**"             // optional: exclude db connection
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "html"]
};
