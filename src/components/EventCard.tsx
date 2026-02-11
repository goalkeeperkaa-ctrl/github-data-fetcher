import { Calendar, MapPin, Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CATEGORIES, type DbEventCategory } from '@/lib/mock-data';
import { Link } from 'react-router-dom';
import type { Tables } from '@/integrations/supabase/types';

const categoryColorMap: Record<string, string> = {
  concert: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  sport: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  conference: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  theater: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  exhibition: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  festival: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  workshop: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  meetup: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
  party: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
  other: 'bg-muted text-muted-foreground',
};

interface EventCardProps {
  event: Tables<'events'>;
}

const EventCard = ({ event }: EventCardProps) => {
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
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 hover:text-accent"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Heart className="h-4 w-4" />
          </Button>
          {!event.is_free && event.price && (
            <Badge className="absolute bottom-3 right-3 bg-primary/90 backdrop-blur-sm">
              {event.price} ₽
            </Badge>
          )}
          {event.is_free && (
            <Badge className="absolute bottom-3 right-3 bg-emerald-500/90 backdrop-blur-sm text-white">
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
