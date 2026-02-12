-- Fix 1: Restrict profiles to authenticated users only
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Fix 2: Add explicit deny-all policies on otp_codes
CREATE POLICY "Deny all select on otp_codes"
ON public.otp_codes FOR SELECT
USING (false);

CREATE POLICY "Deny all insert on otp_codes"
ON public.otp_codes FOR INSERT
WITH CHECK (false);

CREATE POLICY "Deny all update on otp_codes"
ON public.otp_codes FOR UPDATE
USING (false);

CREATE POLICY "Deny all delete on otp_codes"
ON public.otp_codes FOR DELETE
USING (false);