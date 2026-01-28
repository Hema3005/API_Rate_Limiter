-- Active: 1769507674052@@127.0.0.1@5432@user_management

CREATE DATABASE user_management;

CREATE TABLE api_clients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE api_keys (
  id SERIAL PRIMARY KEY,
  client_id INT REFERENCES api_clients(id),
  api_key TEXT UNIQUE NOT NULL,
  daily_limit INT DEFAULT 1000,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE api_rate_limits (
  api_key_id INT REFERENCES api_keys(id),
  request_date DATE,
  request_count INT DEFAULT 0,
  PRIMARY KEY (api_key_id, request_date)
);

CREATE TABLE api_usage (
  id SERIAL PRIMARY KEY,
  api_key_id INT REFERENCES api_keys(id),
  endpoint TEXT,
  status_code INT,
  request_time TIMESTAMP DEFAULT NOW()
);
