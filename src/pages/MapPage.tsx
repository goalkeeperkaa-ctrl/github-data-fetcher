import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import Header from '@/components/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, ExternalLink } from 'lucide-react';
import BrandPin from '@/components/BrandPin';
import { CATEGORIES } from '@/lib/mock-data';

// Fix default marker icon issue with webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CATEGORY_COLORS: Record<string, string> = {
  concert: '#8b5cf6',
  sport: '#22c55e',
  conference: '#3b82f6',
  theater: '#ec4899',
  exhibition: '#f59e0b',
  festival: '#ef4444',
  workshop: '#14b8a6',
  meetup: '#6366f1',
  party: '#f97316',
  other: '#64748b',
};

const createCategoryIcon = (category: string) => {
  const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
  const cat = CATEGORIES.find((c) => c.value === category);
  const emoji = cat?.emoji || '📍';

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      width: 36px;
      height: 36px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      border: 2px solid white;
    ">
      <span style="transform: rotate(45deg); font-size: 16px; line-height: 1;">${emoji}</span>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

const MapPage = () => {
  const [events, setEvents] = useState<Tables<'events'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(CATEGORIES.map((c) => c.value))
  );

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'approved')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .order('date_start', { ascending: true });

      if (data) setEvents(data);
      setLoading(false);
    };

    fetchEvents();
  }, []);

  const toggleCategory = (category: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(category)) {
      newSelected.delete(category);
    } else {
      newSelected.add(category);
    }
    setSelectedCategories(newSelected);
  };

  const filteredEvents = events.filter((event) =>
    selectedCategories.has(event.category)
  );

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  // Center on Moscow by default, or first event
  const center: [number, number] =
    filteredEvents.length > 0
      ? [filteredEvents[0].latitude!, filteredEvents[0].longitude!]
      : [55.75, 37.62];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 relative">
        {loading ? (
          <div className="container py-10 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-[calc(100vh-12rem)] w-full rounded-xl" />
          </div>
        ) : (
          <>
            {/* Category Filters */}
            <div className="absolute top-2 left-2 z-[1000] bg-background/90 backdrop-blur-md rounded-lg shadow-md p-3 max-w-xs">
              <p className="text-xs font-semibold text-foreground mb-2">Категории</p>
              <div className="space-y-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => toggleCategory(cat.value)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                      selectedCategories.has(cat.value)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <span className="mr-2">{cat.emoji}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Map Container */}
            <div className="h-[calc(100vh-4rem)]">
              <MapContainer
                center={center}
                zoom={filteredEvents.length > 0 ? 12 : 5}
                className="h-full w-full z-0"
                scrollWheelZoom
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {filteredEvents.map((event) => {
                  const cat = CATEGORIES.find((c) => c.value === event.category);
                  return (
                    <Marker
                      key={event.id}
                      position={[event.latitude!, event.longitude!]}
                      icon={createCategoryIcon(event.category)}
                    >
                      <Popup maxWidth={280} minWidth={220}>
                        <div className="space-y-2 p-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{cat?.emoji}</span>
                            <span className="text-xs font-medium text-muted-foreground">
                              {cat?.label}
                            </span>
                          </div>
                          <h3 className="font-semibold text-sm leading-tight">
                            {event.title}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDate(event.date_start)}, {formatTime(event.date_start)}
                          </div>
                          {(event.city || event.address) && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <BrandPin className="h-3 w-auto" />
                              {[event.city, event.address].filter(Boolean).join(', ')}
                            </div>
                          )}
                          <div className="text-xs font-medium">
                            {event.is_free ? (
                              <span className="text-primary">Бесплатно</span>
                            ) : event.price != null ? (
                              <span>{event.price} ₽</span>
                            ) : (
                              <span className="text-muted-foreground">Цена не указана</span>
                            )}
                          </div>
                          <Link to={`/event/${event.id}`}>
                            <Button size="sm" variant="outline" className="w-full mt-1 text-xs h-7">
                              Подробнее <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>

              {/* Event count badge */}
              <div className="absolute top-2 right-2 z-[1000]">
                <Badge variant="secondary" className="backdrop-blur-md bg-background/80 shadow-md px-3 py-1.5 text-sm">
                  {filteredEvents.length} {filteredEvents.length === 1 ? 'мероприятие' : 'мероприятий'} на карте
                </Badge>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default MapPage;
