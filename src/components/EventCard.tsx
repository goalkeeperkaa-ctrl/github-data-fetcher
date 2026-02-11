import { Calendar, MapPin, Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CATEGORIES, type Event } from '@/lib/mock-data';
import { Link } from 'react-router-dom';

const categoryColorMap: Record<string, string> = {
  music: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  sport: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  education: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  food: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  art: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  tech: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  other: 'bg-muted text-muted-foreground',
};

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const cat = CATEGORIES.find((c) => c.value === event.category);
  const formattedDate = new Date(event.date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });

  return (
    <Link to={`/event/${event.id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer">
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={event.image}
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
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-lg font-semibold text-white leading-tight line-clamp-2">
              {event.title}
            </h3>
          </div>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formattedDate}, {event.time}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {event.city}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
        </div>
      </Card>
    </Link>
  );
};

export default EventCard;
