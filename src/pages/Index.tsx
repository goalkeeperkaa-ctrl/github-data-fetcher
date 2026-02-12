import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import SearchAndFilters from '@/components/SearchAndFilters';
import EventCard from '@/components/EventCard';
import { CATEGORIES, type DbEventCategory } from '@/lib/mock-data';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useFavorites } from '@/hooks/useFavorites';
import BrandPin from '@/components/BrandPin';
import StoriesRow from '@/components/StoriesRow';

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, delay: i * 0.08, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

const Index = () => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DbEventCategory | 'all'>('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [events, setEvents] = useState<Tables<'events'>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      let query = supabase
        .from('events')
        .select('*')
        .eq('status', 'approved')
        .order('date_start', { ascending: true });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }
      if (selectedCity !== 'all') {
        query = query.eq('city', selectedCity);
      }
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (!error && data) {
        setEvents(data);
      }
      setLoading(false);
    };

    fetchEvents();
  }, [searchQuery, selectedCategory, selectedCity]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container py-6 space-y-6 flex-1">
        <StoriesRow />
        <HeroSection />
        <SearchAndFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedCity={selectedCity}
          onCityChange={setSelectedCity}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {viewMode === 'list' ? (
          <>
            <motion.div
              className="flex items-center justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-sm text-muted-foreground">
                Найдено: <span className="font-medium text-foreground">{events.length}</span> мероприятий
              </p>
            </motion.div>
            {loading ? (
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
                {events.map((event, i) => (
                  <motion.div
                    key={event.id}
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <EventCard event={event} isFavorite={isFavorite(event.id)} onToggleFavorite={toggleFavorite} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                className="flex flex-col items-center justify-center py-20 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  initial={{ y: -10 }}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <BrandPin className="w-16 h-20 mb-4 opacity-30" />
                </motion.div>
                <p className="text-lg font-medium mb-1">Ничего не найдено</p>
                <p className="text-sm text-muted-foreground">Попробуйте изменить фильтры или поисковый запрос</p>
              </motion.div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-border h-[400px] text-muted-foreground">
            Карта будет добавлена на следующем этапе
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
