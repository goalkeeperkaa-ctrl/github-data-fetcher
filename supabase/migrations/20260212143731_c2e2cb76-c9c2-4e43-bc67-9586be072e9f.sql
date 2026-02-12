
-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete own notifications
CREATE POLICY "Users can delete own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

-- Service role can insert notifications (via triggers/functions)
CREATE POLICY "Service can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create a function to auto-notify on event status change
CREATE OR REPLACE FUNCTION public.notify_event_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      NEW.user_id,
      CASE NEW.status
        WHEN 'approved' THEN 'Мероприятие одобрено'
        WHEN 'rejected' THEN 'Мероприятие отклонено'
        ELSE 'Статус мероприятия изменён'
      END,
      'Ваше мероприятие "' || NEW.title || '" ' ||
      CASE NEW.status
        WHEN 'approved' THEN 'было одобрено и опубликовано.'
        WHEN 'rejected' THEN 'было отклонено модератором.'
        ELSE 'изменило статус на ' || NEW.status || '.'
      END,
      CASE NEW.status
        WHEN 'approved' THEN 'success'
        WHEN 'rejected' THEN 'error'
        ELSE 'info'
      END,
      '/event/' || NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for event status changes
CREATE TRIGGER on_event_status_change
AFTER UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.notify_event_status_change();
