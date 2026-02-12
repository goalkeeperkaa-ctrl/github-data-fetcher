
-- Fix the insert policy to be more restrictive - only allow authenticated users to insert their own notifications
DROP POLICY "Service can insert notifications" ON public.notifications;

-- Notifications are inserted by the SECURITY DEFINER trigger function, not directly by users.
-- We still need a policy for the service role trigger to work, but restrict to own user_id
CREATE POLICY "Insert own notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);
