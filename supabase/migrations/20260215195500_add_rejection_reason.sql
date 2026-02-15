-- Add rejection reason to events
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Update notify function to include rejection reason
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
      CASE NEW.status
        WHEN 'approved' THEN 'Ваше мероприятие "' || NEW.title || '" было одобрено и опубликовано.'
        WHEN 'rejected' THEN 'Ваше мероприятие "' || NEW.title || '" было отклонено.' ||
          COALESCE(' Причина: ' || NULLIF(NEW.rejection_reason, ''), '')
        ELSE 'Ваше мероприятие "' || NEW.title || '" изменило статус на ' || NEW.status || '.'
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
