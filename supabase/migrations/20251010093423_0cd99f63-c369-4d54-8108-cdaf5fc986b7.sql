-- Remove sensitive API keys from client-accessible payment_settings table
-- These will be moved to secure server-side secrets

ALTER TABLE public.payment_settings 
DROP COLUMN IF EXISTS razorpay_key_id,
DROP COLUMN IF EXISTS razorpay_key_secret,
DROP COLUMN IF EXISTS webhook_secret;

-- Add a flag to track if keys have been configured (without exposing the actual keys)
ALTER TABLE public.payment_settings 
ADD COLUMN IF NOT EXISTS keys_configured boolean DEFAULT false;