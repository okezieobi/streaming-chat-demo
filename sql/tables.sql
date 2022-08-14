DROP TABLE IF EXISTS base CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS livestreams CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE TABLE base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE users(
    LIKE base INCLUDING INDEXES INCLUDING DEFAULTS,
    email VARCHAR NOT NULL,
    password VARCHAR,
    UNIQUE(email)
);
CREATE TABLE messages(
    LIKE base INCLUDING INDEXES INCLUDING DEFAULTS,
    from VARCHAR NOT NULL REFERENCES users(email),
    to VARCHAR REFERENCES users(email),
    content VARCHAR NOT NULL
);
CREATE TABLE livestream(
    LIKE base INCLUDING INDEXES INCLUDING DEFAULTS,
    url VARCHAR NOT NULL,
    "userId" UUID NOT NULL REFERENCES users,
    UNIQUE("userId")
);
CREATE TABLE accounts(
    LIKE base INCLUDING INDEXES INCLUDING DEFAULTS,
    balance DECIMAL NOT NULL,
    "userId" UUID NOT NULL REFERENCES users,
    UNIQUE("userId")
)