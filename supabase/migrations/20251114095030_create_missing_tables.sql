/*
  # Create Missing Tables for SubSynapse Backend

  1. New Tables
    - `transactions` - Credit/debit transactions for users
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `type` (text - credit/debit)
      - `amount` (numeric)
      - `status` (text - pending/completed/failed)
      - `payment_gateway_id` (text)
      - `created_at` (timestamptz)

    - `credentials` - Encrypted subscription credentials
      - `id` (uuid, primary key)
      - `group_id` (uuid, foreign key to subscription_groups, unique)
      - `credentials` (text - encrypted)
      - `created_at` (timestamptz)

    - `reviews` - User reviews for subscription groups
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `group_id` (uuid, foreign key to subscription_groups)
      - `rating` (integer)
      - `comment` (text)
      - `created_at` (timestamptz)

    - `audit_logs` - System audit trail
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `admin_id` (uuid)
      - `action` (text)
      - `table_name` (text)
      - `old_values` (jsonb)
      - `new_values` (jsonb)
      - `ip_address` (text)
      - `created_at` (timestamptz)

    - `email_verifications` - Email verification tokens
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `token` (text, unique)
      - `expires_at` (timestamptz)
      - `used_at` (timestamptz)

    - `password_reset_tokens` - Password reset tokens
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `token` (text, unique)
      - `expires_at` (timestamptz)
      - `used_at` (timestamptz)

    - `active_sessions` - User session management
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `session_token` (text, unique)
      - `expires_at` (timestamptz)
      - `ip_address` (text)
      - `user_agent` (text)
      - `created_at` (timestamptz)

    - `credential_access_logs` - Track credential access
      - `id` (uuid, primary key)
      - `group_id` (uuid, foreign key to subscription_groups)
      - `user_id` (uuid, foreign key to users)
      - `ip_address` (text)
      - `user_agent` (text)
      - `created_at` (timestamptz)

    - `admins` - Admin user accounts
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password` (text)
      - `api_key` (text, unique)
      - `two_factor_secret` (text)
      - `is_two_factor_enabled` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Updates to Existing Tables
    - Add missing columns to `users` table
    - Update `subscription_groups` table structure

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for authenticated users
*/

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  amount numeric NOT NULL,
  status text DEFAULT 'pending',
  payment_gateway_id text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_gateway_id ON transactions(payment_gateway_id);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create credentials table
CREATE TABLE IF NOT EXISTS credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid UNIQUE REFERENCES subscription_groups(id) ON DELETE CASCADE,
  credentials text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view credentials"
  ON credentials FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_memberships
      WHERE group_memberships.group_id = credentials.group_id
      AND group_memberships.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM subscription_groups
      WHERE subscription_groups.id = credentials.group_id
      AND subscription_groups.created_by = auth.uid()
    )
  );

CREATE POLICY "Group owners can insert credentials"
  ON credentials FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM subscription_groups
      WHERE subscription_groups.id = credentials.group_id
      AND subscription_groups.created_by = auth.uid()
    )
  );

CREATE POLICY "Group owners can update credentials"
  ON credentials FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM subscription_groups
      WHERE subscription_groups.id = credentials.group_id
      AND subscription_groups.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM subscription_groups
      WHERE subscription_groups.id = credentials.group_id
      AND subscription_groups.created_by = auth.uid()
    )
  );

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  group_id uuid REFERENCES subscription_groups(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_group_id ON reviews(group_id);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reviews for joined groups"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM group_memberships
      WHERE group_memberships.group_id = reviews.group_id
      AND group_memberships.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  admin_id uuid,
  action text NOT NULL,
  table_name text,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (false);

-- Create email_verifications table
CREATE TABLE IF NOT EXISTS email_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token);

ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own email verifications"
  ON email_verifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);

ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct access to password reset tokens"
  ON password_reset_tokens FOR SELECT
  TO authenticated
  USING (false);

-- Create active_sessions table
CREATE TABLE IF NOT EXISTS active_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_active_sessions_user_id ON active_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_token ON active_sessions(session_token);

ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON active_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON active_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create credential_access_logs table
CREATE TABLE IF NOT EXISTS credential_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES subscription_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credential_access_logs_group_id ON credential_access_logs(group_id);
CREATE INDEX IF NOT EXISTS idx_credential_access_logs_user_id ON credential_access_logs(user_id);

ALTER TABLE credential_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group owners can view credential access logs"
  ON credential_access_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM subscription_groups
      WHERE subscription_groups.id = credential_access_logs.group_id
      AND subscription_groups.created_by = auth.uid()
    )
  );

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  api_key text UNIQUE NOT NULL,
  two_factor_secret text,
  is_two_factor_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct access to admins table"
  ON admins FOR SELECT
  TO authenticated
  USING (false);

-- Add missing columns to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'phone'
  ) THEN
    ALTER TABLE users ADD COLUMN phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE users ADD COLUMN is_active boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'last_login'
  ) THEN
    ALTER TABLE users ADD COLUMN last_login timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'failed_login_attempts'
  ) THEN
    ALTER TABLE users ADD COLUMN failed_login_attempts integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'lockout_until'
  ) THEN
    ALTER TABLE users ADD COLUMN lockout_until timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'two_factor_secret'
  ) THEN
    ALTER TABLE users ADD COLUMN two_factor_secret text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'is_two_factor_enabled'
  ) THEN
    ALTER TABLE users ADD COLUMN is_two_factor_enabled boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'notifications'
  ) THEN
    ALTER TABLE users ADD COLUMN notifications jsonb;
  END IF;
END $$;

-- Add missing columns to subscription_groups table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscription_groups' AND column_name = 'service_type'
  ) THEN
    ALTER TABLE subscription_groups ADD COLUMN service_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscription_groups' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE subscription_groups ADD COLUMN is_active boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscription_groups' AND column_name = 'admin_approved'
  ) THEN
    ALTER TABLE subscription_groups ADD COLUMN admin_approved boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscription_groups' AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE subscription_groups ADD COLUMN owner_id uuid REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add missing columns to group_memberships table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'group_memberships' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE group_memberships ADD COLUMN is_active boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'group_memberships' AND column_name = 'join_date'
  ) THEN
    ALTER TABLE group_memberships ADD COLUMN join_date timestamptz DEFAULT now();
  END IF;
END $$;

-- Add missing columns to withdrawal_requests table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'withdrawal_requests' AND column_name = 'requested_at'
  ) THEN
    ALTER TABLE withdrawal_requests ADD COLUMN requested_at timestamptz DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'withdrawal_requests' AND column_name = 'cooldown_expires_at'
  ) THEN
    ALTER TABLE withdrawal_requests ADD COLUMN cooldown_expires_at timestamptz;
  END IF;
END $$;