import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import EventCard from '@/components/EventCard';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const FavoritesPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { favoriteIds, toggleFavorite, isFavorite, loading: favsLoading } = useFavorites();
  const [events, setEvents] = useState<Tables<'events'>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (favsLoading || !user) return;

    const ids = Array.from(favoriteIds);
    if (ids.length === 0) {
      setEvents([]);
      setLoading(false);
      return;
    }

    const fetchEvents = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('events')
        .select('*')
        .in('id', ids)
        .order('date_start', { ascending: true });

      if (data) setEvents(data);
      setLoading(false);
    };

    fetchEvents();
  }, [favoriteIds, favsLoading, user]);

  const isLoading = authLoading || favsLoading || loading;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-destructive fill-destructive" />
            Избранное
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Мероприятия, которые вы сохранили
          </p>
        </div>

        {!user && !authLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium mb-1">Войдите, чтобы видеть избранное</p>
            <p className="text-sm text-muted-foreground mb-4">
              Сохраняйте интересные мероприятия и возвращайтесь к ним позже
            </p>
            <Link to="/auth">
              <Button>Войти</Button>
            </Link>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[16/10] rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isFavorite={isFavorite(event.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium mb-1">Пока ничего нет</p>
            <p className="text-sm text-muted-foreground mb-4">
              Нажмите на сердечко на карточке мероприятия, чтобы добавить его сюда
            </p>
            <Link to="/">
              <Button variant="outline">Смотреть мероприятия</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default FavoritesPage;
