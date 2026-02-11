import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import Header from '@/components/Header';
import { CATEGORIES } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import {
  Calendar,
  MapPin,
  ArrowLeft,
  Clock,
  Heart,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Tables<'events'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
      } else {
        setEvent(data);
      }
      setLoading(false);
    };

    fetchEvent();
  }, [id]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Ссылка скопирована!');
    } catch {
      toast.error('Не удалось скопировать');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-6 max-w-4xl space-y-6">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="aspect-[21/9] rounded-xl" />
          <Skeleton className="h-10 w-3/4" />
          <div className="flex gap-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-32 w-full" />
        </main>
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-20 flex flex-col items-center text-center gap-4">
          <p className="text-5xl">😕</p>
          <h1 className="text-2xl font-bold">Мероприятие не найдено</h1>
          <p className="text-muted-foreground">Возможно, оно было удалено или ещё не одобрено</p>
          <Button asChild variant="outline">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              На главную
            </Link>
          </Button>
        </main>
      </div>
    );
  }

  const cat = CATEGORIES.find((c) => c.value === event.category);

  const dateStart = new Date(event.date_start);
  const dateEnd = event.date_end ? new Date(event.date_end) : null;

  const formatDate = (d: Date) =>
    d.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  const hasCoords = event.latitude != null && event.longitude != null;
  const mapSrc = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${event.longitude! - 0.01},${event.latitude! - 0.006},${event.longitude! + 0.01},${event.latitude! + 0.006}&layer=mapnik&marker=${event.latitude},${event.longitude}`
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 max-w-4xl">
        {/* Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад к мероприятиям
        </Link>

        {/* Hero image */}
        <div className="relative rounded-xl overflow-hidden aspect-[21/9] mb-6">
          <img
            src={
              event.image_url ||
              'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=500&fit=crop'
            }
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <Badge
              variant="outline"
              className="mb-3 bg-white/15 backdrop-blur-md text-white border-white/25"
            >
              {cat?.emoji} {cat?.label}
            </Badge>
            <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight">
              {event.title}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {event.description && (
              <section>
                <h2 className="text-lg font-semibold mb-3">Описание</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </section>
            )}

            {/* Map */}
            {hasCoords && mapSrc && (
              <section>
                <h2 className="text-lg font-semibold mb-3">На карте</h2>
                <div className="rounded-xl overflow-hidden border border-border">
                  <iframe
                    title="Карта мероприятия"
                    src={mapSrc}
                    className="w-full h-[320px]"
                    style={{ border: 0 }}
                    loading="lazy"
                  />
                </div>
                {event.address && (
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${event.latitude}&mlon=${event.longitude}#map=16/${event.latitude}/${event.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-2"
                  >
                    Открыть на карте <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            {/* Date & time card */}
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium capitalize">{formatDate(dateStart)}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <Clock className="h-3.5 w-3.5" />
                      {formatTime(dateStart)}
                      {dateEnd && ` — ${formatTime(dateEnd)}`}
                    </p>
                    {dateEnd &&
                      dateStart.toDateString() !== dateEnd.toDateString() && (
                        <p className="text-sm text-muted-foreground mt-1">
                          до {formatDate(dateEnd)}
                        </p>
                      )}
                  </div>
                </div>

                {(event.city || event.address) && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      {event.city && <p className="font-medium">{event.city}</p>}
                      {event.address && (
                        <p className="text-sm text-muted-foreground">{event.address}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Price */}
                <div className="pt-2 border-t border-border">
                  {event.is_free ? (
                    <p className="text-lg font-bold text-primary">Бесплатно</p>
                  ) : event.price != null ? (
                    <p className="text-lg font-bold">{event.price} ₽</p>
                  ) : (
                    <p className="text-muted-foreground">Цена не указана</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                <Heart className="h-4 w-4 mr-1.5" />
                В избранное
              </Button>
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default EventDetailPage;
