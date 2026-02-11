
-- Table to store OTP codes for email verification
CREATE TABLE public.otp_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Allow edge functions (service role) to manage OTP codes
-- No public access needed - all operations go through edge functions

-- Index for quick lookup
CREATE INDEX idx_otp_codes_email_code ON public.otp_codes (email, code);

-- Auto-cleanup old codes (optional trigger)
CREATE OR REPLACE FUNCTION public.cleanup_expired_otp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.otp_codes WHERE expires_at < now() - interval '1 hour';
  RETURN NEW;
END;
$$;

CREATE TRIGGER cleanup_otp_on_insert
AFTER INSERT ON public.otp_codes
FOR EACH STATEMENT
EXECUTE FUNCTION public.cleanup_expired_otp();
