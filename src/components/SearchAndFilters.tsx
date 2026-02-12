import { useState } from 'react';
import { Search, SlidersHorizontal, List, X, CalendarIcon, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import BrandPin from '@/components/BrandPin';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { CATEGORIES, CITIES, type DbEventCategory } from '@/lib/mock-data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface SearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: DbEventCategory | 'all';
  onCategoryChange: (c: DbEventCategory | 'all') => void;
  selectedCity: string;
  onCityChange: (c: string) => void;
  viewMode: 'list' | 'map';
  onViewModeChange: (m: 'list' | 'map') => void;
  selectedDate: Date | undefined;
  onDateChange: (d: Date | undefined) => void;
}

const SearchAndFilters = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedCity,
  onCityChange,
  viewMode,
  onViewModeChange,
  selectedDate,
  onDateChange,
}: SearchAndFiltersProps) => {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const hasFilters = selectedCategory !== 'all' || selectedCity !== 'all' || !!selectedDate;

  const activeCategoryLabel =
    selectedCategory === 'all'
      ? 'Категория'
      : CATEGORIES.find((c) => c.value === selectedCategory)?.label ?? 'Категория';

  return (
    <div className="space-y-3">
      {/* Search row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск мероприятий..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex rounded-lg border bg-card p-0.5">
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="icon"
            className="h-9 w-9"
            onClick={() => onViewModeChange('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'map' ? 'default' : 'ghost'}
            size="icon"
            className="h-9 w-9"
            onClick={() => onViewModeChange('map')}
          >
            <BrandPin className="h-4 w-auto" />
          </Button>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />

        {/* Category popover */}
        <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'h-8 text-sm gap-1.5',
                selectedCategory !== 'all' && 'border-primary text-primary'
              )}
            >
              {activeCategoryLabel}
              <ChevronDown className="h-3.5 w-3.5 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="start">
            <div className="flex flex-col gap-1">
              <button
                onClick={() => { onCategoryChange('all'); setCategoryOpen(false); }}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent',
                  selectedCategory === 'all' && 'bg-accent font-medium'
                )}
              >
                Все категории
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => { onCategoryChange(cat.value); setCategoryOpen(false); }}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent',
                    selectedCategory === cat.value && 'bg-accent font-medium'
                  )}
                >
                  <span>{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* City select */}
        <Select value={selectedCity} onValueChange={onCityChange}>
          <SelectTrigger className={cn(
            'w-[160px] h-8 text-sm',
            selectedCity !== 'all' && 'border-primary text-primary'
          )}>
            <SelectValue placeholder="Город" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все города</SelectItem>
            {CITIES.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'h-8 text-sm gap-1.5',
                selectedDate && 'border-primary text-primary'
              )}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              {selectedDate ? format(selectedDate, 'd MMM', { locale: ru }) : 'Дата'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onDateChange}
              className={cn('p-3 pointer-events-auto')}
            />
          </PopoverContent>
        </Popover>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => {
              onCategoryChange('all');
              onCityChange('all');
              onDateChange(undefined);
            }}
          >
            <X className="h-3 w-3" />
            Сбросить
          </Button>
        )}
      </div>
    </div>
  );
};

export default SearchAndFilters;
