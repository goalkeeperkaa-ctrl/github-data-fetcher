import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useFavorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }

    const fetchFavorites = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('favorites')
        .select('event_id')
        .eq('user_id', user.id);

      if (data) {
        setFavoriteIds(new Set(data.map((f) => f.event_id)));
      }
      setLoading(false);
    };

    fetchFavorites();
  }, [user]);

  const toggleFavorite = useCallback(
    async (eventId: string) => {
      if (!user) {
        toast({
          title: 'Необходима авторизация',
          description: 'Войдите, чтобы сохранять мероприятия в избранное',
          variant: 'destructive',
        });
        return;
      }

      const isFav = favoriteIds.has(eventId);

      // Optimistic update
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isFav) next.delete(eventId);
        else next.add(eventId);
        return next;
      });

      if (isFav) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('event_id', eventId);

        if (error) {
          // Revert
          setFavoriteIds((prev) => new Set(prev).add(eventId));
          toast({ title: 'Ошибка', description: 'Не удалось убрать из избранного', variant: 'destructive' });
        }
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, event_id: eventId });

        if (error) {
          // Revert
          setFavoriteIds((prev) => {
            const next = new Set(prev);
            next.delete(eventId);
            return next;
          });
          toast({ title: 'Ошибка', description: 'Не удалось добавить в избранное', variant: 'destructive' });
        }
      }
    },
    [user, favoriteIds, toast]
  );

  const isFavorite = useCallback(
    (eventId: string) => favoriteIds.has(eventId),
    [favoriteIds]
  );

  return { favoriteIds, toggleFavorite, isFavorite, loading };
};
