import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import SearchAndFilters from '@/components/SearchAndFilters';
import EventCard from '@/components/EventCard';
import { mockEvents, type EventCategory } from '@/lib/mock-data';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const filteredEvents = useMemo(() => {
    return mockEvents.filter((event) => {
      const matchesSearch =
        !searchQuery ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
      const matchesCity = selectedCity === 'all' || event.city === selectedCity;
      return matchesSearch && matchesCategory && matchesCity;
    });
  }, [searchQuery, selectedCategory, selectedCity]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
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
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Найдено: <span className="font-medium text-foreground">{filteredEvents.length}</span> мероприятий
              </p>
            </div>
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-lg font-medium mb-1">Ничего не найдено</p>
                <p className="text-sm text-muted-foreground">Попробуйте изменить фильтры или поисковый запрос</p>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-border h-[400px] text-muted-foreground">
            Карта будет добавлена на следующем этапе
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
