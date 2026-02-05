-- Supabase SQL for AM$ Credits System
-- Run these commands in Supabase SQL Editor

-- 1. User Credits Table
CREATE TABLE IF NOT EXISTS user_credits (
  user_id uuid REFERENCES auth.users(id) PRIMARY KEY,
  balance integer DEFAULT 0 CHECK (balance >= 0),
  updated_at timestamptz DEFAULT now()
);

-- 2. Credit Transactions Table
CREATE TABLE IF NOT EXISTS credit_transactions (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  amount integer NOT NULL, -- Can be negative for usage, positive for charges
  type text NOT NULL CHECK (type IN ('charge', 'use', 'refund', 'bonus', 'admin')),
  payment_key text, -- TossPayments payment key (for charge transactions)
  order_id text, -- Order ID for tracking
  description text,
  metadata jsonb, -- Store additional info like package details
  created_at timestamptz DEFAULT now()
);

-- 3. RLS Policies - Users can only read their own credits
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- User can read/update only their own credit balance
CREATE POLICY "Users can view own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits" ON user_credits
  FOR UPDATE USING (auth.uid() = user_id);

-- User can read only their own transactions
CREATE POLICY "Users can view own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- 4. Function to add credits atomically (for purchase confirmations)
-- Note: This function is SECURITY DEFINER and can be called by anon users for payment confirmation
CREATE OR REPLACE FUNCTION add_user_credits(
  target_user_id uuid,
  credit_amount integer,
  transaction_type text DEFAULT 'charge',
  payment_key_val text DEFAULT NULL,
  order_id_val text DEFAULT NULL,
  description_val text DEFAULT NULL,
  metadata_val jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert transaction record first
  INSERT INTO credit_transactions (
    user_id,
    amount,
    type,
    payment_key,
    order_id,
    description,
    metadata,
    created_at
  ) VALUES (
    target_user_id,
    credit_amount,
    transaction_type,
    payment_key_val,
    order_id_val,
    description_val,
    metadata_val,
    now()
  );

  -- Update or insert user balance
  INSERT INTO user_credits (user_id, balance, updated_at)
  VALUES (target_user_id, credit_amount, now())
  ON CONFLICT (user_id)
  DO UPDATE SET 
    balance = user_credits.balance + credit_amount,
    updated_at = now();
END;
$$;

-- 5. Function to deduct credits (for task payments)
CREATE OR REPLACE FUNCTION deduct_user_credits(
  target_user_id uuid,
  credit_amount integer,
  description_val text DEFAULT NULL,
  metadata_val jsonb DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance integer;
BEGIN
  -- Get current balance
  SELECT balance INTO current_balance
  FROM user_credits
  WHERE user_id = target_user_id;

  -- Check if user has enough credits
  IF current_balance IS NULL OR current_balance < credit_amount THEN
    RETURN false;
  END IF;

  -- Insert deduction transaction
  INSERT INTO credit_transactions (
    user_id,
    amount,
    type,
    description,
    metadata,
    created_at
  ) VALUES (
    target_user_id,
    -credit_amount, -- Negative amount for deduction
    'use',
    description_val,
    metadata_val,
    now()
  );

  -- Update balance
  UPDATE user_credits
  SET 
    balance = balance - credit_amount,
    updated_at = now()
  WHERE user_id = target_user_id;

  RETURN true;
END;
$$;

-- 6. Function to get user credit balance
CREATE OR REPLACE FUNCTION get_user_credits(target_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_balance integer;
BEGIN
  SELECT balance INTO user_balance
  FROM user_credits
  WHERE user_id = target_user_id;

  RETURN COALESCE(user_balance, 0);
END;
$$;

-- 7. Trigger to update user_credits.updated_at on any change
CREATE OR REPLACE FUNCTION update_credits_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_user_credits_timestamp
  BEFORE UPDATE ON user_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_credits_timestamp();

-- 8. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_payment_key ON credit_transactions(payment_key);

-- 9. Grant execute permissions for payment functions to anon (for TossPayments confirmation)
GRANT EXECUTE ON FUNCTION add_user_credits TO anon;
GRANT EXECUTE ON FUNCTION get_user_credits TO anon;

-- 10. Insert initial credits table entries for existing users (if any)
INSERT INTO user_credits (user_id, balance, updated_at)
SELECT id, 0, now()
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- 11. Note: You may need SUPABASE_SERVICE_ROLE_KEY in .env.local for admin operations
-- Add this line to your .env.local:
-- SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here