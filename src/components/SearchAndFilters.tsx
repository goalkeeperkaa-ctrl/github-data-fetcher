import { Search, SlidersHorizontal, List, Map, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CATEGORIES, CITIES, type DbEventCategory } from '@/lib/mock-data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: DbEventCategory | 'all';
  onCategoryChange: (c: DbEventCategory | 'all') => void;
  selectedCity: string;
  onCityChange: (c: string) => void;
  viewMode: 'list' | 'map';
  onViewModeChange: (m: 'list' | 'map') => void;
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
}: SearchAndFiltersProps) => {
  const hasFilters = selectedCategory !== 'all' || selectedCity !== 'all';

  return (
    <div className="space-y-4">
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
            <Map className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
        
        {/* Category chips */}
        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            className="cursor-pointer transition-colors"
            onClick={() => onCategoryChange('all')}
          >
            Все
          </Badge>
          {CATEGORIES.map((cat) => (
            <Badge
              key={cat.value}
              variant={selectedCategory === cat.value ? 'default' : 'outline'}
              className="cursor-pointer transition-colors"
              onClick={() => onCategoryChange(cat.value)}
            >
              {cat.emoji} {cat.label}
            </Badge>
          ))}
        </div>

        {/* City select */}
        <Select value={selectedCity} onValueChange={onCityChange}>
          <SelectTrigger className="w-[160px] h-8 text-sm">
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

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => {
              onCategoryChange('all');
              onCityChange('all');
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
