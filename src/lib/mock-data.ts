export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  city: string;
  category: EventCategory;
  image: string;
  organizer: string;
  lat?: number;
  lng?: number;
}

export type EventCategory = 'music' | 'sport' | 'education' | 'food' | 'art' | 'tech' | 'other';

export const CATEGORIES: { value: EventCategory; label: string; emoji: string }[] = [
  { value: 'music', label: 'Музыка', emoji: '🎵' },
  { value: 'sport', label: 'Спорт', emoji: '⚽' },
  { value: 'education', label: 'Образование', emoji: '📚' },
  { value: 'food', label: 'Еда', emoji: '🍔' },
  { value: 'art', label: 'Искусство', emoji: '🎨' },
  { value: 'tech', label: 'Технологии', emoji: '💻' },
  { value: 'other', label: 'Другое', emoji: '✨' },
];

export const CITIES = ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург'];

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Фестиваль электронной музыки',
    description: 'Крупнейший фестиваль электронной музыки в этом году с участием мировых диджеев.',
    date: '2026-03-15',
    time: '18:00',
    location: 'Парк Горького',
    city: 'Москва',
    category: 'music',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=400&fit=crop',
    organizer: 'EventPro',
    lat: 55.7312,
    lng: 37.6031,
  },
  {
    id: '2',
    title: 'Марафон «Белые ночи»',
    description: 'Ежегодный марафон по улицам Санкт-Петербурга во время белых ночей.',
    date: '2026-06-21',
    time: '08:00',
    location: 'Дворцовая площадь',
    city: 'Санкт-Петербург',
    category: 'sport',
    image: 'https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=600&h=400&fit=crop',
    organizer: 'RunClub SPB',
    lat: 59.9398,
    lng: 30.3146,
  },
  {
    id: '3',
    title: 'Конференция по AI и ML',
    description: 'Двухдневная конференция с докладами от ведущих экспертов в области искусственного интеллекта.',
    date: '2026-04-10',
    time: '10:00',
    location: 'Технопарк «Сколково»',
    city: 'Москва',
    category: 'tech',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop',
    organizer: 'TechHub',
    lat: 55.6867,
    lng: 37.3567,
  },
  {
    id: '4',
    title: 'Гастрофестиваль уличной еды',
    description: 'Лучшие рестораны города представят свои блюда на открытом воздухе.',
    date: '2026-05-20',
    time: '12:00',
    location: 'ВДНХ',
    city: 'Москва',
    category: 'food',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop',
    organizer: 'FoodFest',
    lat: 55.8266,
    lng: 37.6375,
  },
  {
    id: '5',
    title: 'Выставка современного искусства',
    description: 'Коллекция работ молодых художников со всей России.',
    date: '2026-03-01',
    time: '11:00',
    location: 'Эрмитаж',
    city: 'Санкт-Петербург',
    category: 'art',
    image: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=600&h=400&fit=crop',
    organizer: 'ArtSpace',
    lat: 59.9398,
    lng: 30.3146,
  },
  {
    id: '6',
    title: 'Лекция «Основы стартапов»',
    description: 'Как запустить свой стартап с нуля: от идеи до первых инвестиций.',
    date: '2026-04-05',
    time: '19:00',
    location: 'IT-парк',
    city: 'Казань',
    category: 'education',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop',
    organizer: 'StartupKZN',
    lat: 55.7879,
    lng: 49.1233,
  },
];
