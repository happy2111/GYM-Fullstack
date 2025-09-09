
-- Create users table
CREATE TABLE IF NOT EXISTS users (
                                     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text,
    email text NOT NULL UNIQUE,
    phone text,
    password text,
    date_of_birth date,
    gender text CHECK (gender IN ('male', 'female', 'other')),
    role text NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'trainer', 'admin')),
    google_id text UNIQUE,
    is_verified boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
    );

-- Create refresh_tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
                                              id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token text NOT NULL UNIQUE,
    ip text,
    user_agent text,
    device text,
    expires_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
    );

-- Visits (QR check-ins)
CREATE TABLE IF NOT EXISTS visits (
                                      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    visited_at timestamptz NOT NULL DEFAULT now(),
    checkin_method text NOT NULL DEFAULT 'qr' CHECK (checkin_method IN ('qr', 'manual', 'admin'))
    );

-- Memberships (abonements)
CREATE TABLE IF NOT EXISTS memberships (
                                           id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('single', 'monthly', 'yearly')),
    start_date date NOT NULL,
    end_date date NOT NULL,
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'frozen')),
    price numeric(10,2) NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
    );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

CREATE INDEX IF NOT EXISTS idx_visits_user_id ON visits(user_id);
CREATE INDEX IF NOT EXISTS idx_visits_visited_at ON visits(visited_at);

CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON memberships(status);
CREATE INDEX IF NOT EXISTS idx_memberships_end_date ON memberships(end_date);

-- Update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
