import type { Database } from '@/integrations/supabase/types';

export type DbEventCategory = Database['public']['Enums']['event_category'];

export const CATEGORIES: { value: DbEventCategory; label: string; emoji: string }[] = [
  { value: 'concert', label: 'Концерты', emoji: '🎵' },
  { value: 'sport', label: 'Спорт', emoji: '⚽' },
  { value: 'conference', label: 'Конференции', emoji: '💻' },
  { value: 'theater', label: 'Театр', emoji: '🎭' },
  { value: 'exhibition', label: 'Выставки', emoji: '🎨' },
  { value: 'festival', label: 'Фестивали', emoji: '🎪' },
  { value: 'workshop', label: 'Мастер-классы', emoji: '📚' },
  { value: 'meetup', label: 'Митапы', emoji: '🤝' },
  { value: 'party', label: 'Вечеринки', emoji: '🎉' },
  { value: 'other', label: 'Другое', emoji: '✨' },
];

export const CITIES = ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург'];
