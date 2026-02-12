import { Calendar, MapPin, Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CATEGORIES, type DbEventCategory } from '@/lib/mock-data';
import { Link } from 'react-router-dom';
import type { Tables } from '@/integrations/supabase/types';

const categoryColorMap: Record<string, string> = {
  concert: 'bg-accent/10 text-accent border-accent/20',
  sport: 'bg-primary/10 text-primary border-primary/20',
  conference: 'bg-brand-gold/10 text-brand-gold border-brand-gold/20',
  theater: 'bg-accent/10 text-accent border-accent/20',
  exhibition: 'bg-brand-gold/10 text-brand-gold border-brand-gold/20',
  festival: 'bg-accent/10 text-accent border-accent/20',
  workshop: 'bg-primary/10 text-primary border-primary/20',
  meetup: 'bg-primary/10 text-primary border-primary/20',
  party: 'bg-accent/10 text-accent border-accent/20',
  other: 'bg-muted text-muted-foreground',
};

interface EventCardProps {
  event: Tables<'events'>;
  isFavorite?: boolean;
  onToggleFavorite?: (eventId: string) => void;
}

const EventCard = ({ event, isFavorite = false, onToggleFavorite }: EventCardProps) => {
  const cat = CATEGORIES.find((c) => c.value === event.category);
  const formattedDate = new Date(event.date_start).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
  const formattedTime = new Date(event.date_start).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Link to={`/event/${event.id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer">
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop'}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <Badge
            variant="outline"
            className={`absolute top-3 left-3 ${categoryColorMap[event.category] || categoryColorMap.other} backdrop-blur-sm border`}
          >
            {cat?.emoji} {cat?.label}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-2 right-2 h-8 w-8 rounded-full backdrop-blur-sm transition-colors ${
              isFavorite
                ? 'bg-accent/90 text-accent-foreground hover:bg-accent'
                : 'bg-white/20 text-white hover:bg-white/40 hover:text-accent'
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite?.(event.id);
            }}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
          {!event.is_free && event.price && (
            <Badge className="absolute bottom-3 right-3 bg-primary/90 backdrop-blur-sm">
              {event.price} ₽
            </Badge>
          )}
          {event.is_free && (
            <Badge className="absolute bottom-3 right-3 bg-primary/90 backdrop-blur-sm text-primary-foreground">
              Бесплатно
            </Badge>
          )}
          <div className="absolute bottom-3 left-3 right-16">
            <h3 className="text-lg font-semibold text-white leading-tight line-clamp-2">
              {event.title}
            </h3>
          </div>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formattedDate}, {formattedTime}
            </span>
            {event.city && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {event.city}
              </span>
            )}
          </div>
          {event.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default EventCard;
