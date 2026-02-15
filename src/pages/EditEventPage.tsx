import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Calendar, MapPin, DollarSign, Upload, ArrowLeft } from 'lucide-react';

const CATEGORIES = [
  { value: 'concert', label: 'Концерт' },
  { value: 'conference', label: 'Конференция' },
  { value: 'sport', label: 'Спорт' },
  { value: 'theater', label: 'Театр' },
  { value: 'exhibition', label: 'Выставка' },
  { value: 'festival', label: 'Фестиваль' },
  { value: 'workshop', label: 'Мастер-класс' },
  { value: 'meetup', label: 'Встреча' },
  { value: 'party', label: 'Вечеринка' },
  { value: 'other', label: 'Другое' },
] as const;

const toLocalInput = (value: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

const EditEventPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [event, setEvent] = useState<Tables<'events'> | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('other');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      setLoadingEvent(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        toast.error('Мероприятие не найдено');
        navigate('/');
        return;
      }

      setEvent(data);
      setTitle(data.title);
      setDescription(data.description || '');
      setCategory(data.category);
      setDateStart(toLocalInput(data.date_start));
      setDateEnd(toLocalInput(data.date_end));
      setAddress(data.address || '');
      setCity(data.city || '');
      setLatitude(data.latitude != null ? String(data.latitude) : '');
      setLongitude(data.longitude != null ? String(data.longitude) : '');
      setIsFree(data.is_free);
      setPrice(data.price != null ? String(data.price) : '');
      setImagePreview(data.image_url || null);
      setLoadingEvent(false);
    };

    fetchEvent();
  }, [id, navigate]);

  useEffect(() => {
    if (event && user && event.user_id !== user.id) {
      toast.error('У вас нет прав на редактирование');
      navigate('/');
    }
  }, [event, user, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !event) {
      toast.error('Необходимо войти в аккаунт');
      return;
    }

    if (!description.trim()) {
      toast.error('Добавьте описание');
      return;
    }
    if (!dateEnd) {
      toast.error('Укажите дату окончания');
      return;
    }
    if (dateStart && dateEnd && new Date(dateEnd) < new Date(dateStart)) {
      toast.error('Дата окончания не может быть раньше даты начала');
      return;
    }
    if (!city.trim()) {
      toast.error('Укажите город');
      return;
    }
    if (!address.trim()) {
      toast.error('Укажите адрес');
      return;
    }
    if (!isFree && !price) {
      toast.error('Укажите цену');
      return;
    }

    setLoading(true);

    try {
      let imageUrl = event.image_url || null;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('event-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const { error } = await supabase
        .from('events')
        .update({
          title,
          description: description || null,
          category: category as any,
          date_start: new Date(dateStart).toISOString(),
          date_end: dateEnd ? new Date(dateEnd).toISOString() : null,
          address: address || null,
          city: city || null,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          is_free: isFree,
          price: isFree ? null : (price ? parseFloat(price) : null),
          image_url: imageUrl,
          status: 'pending',
        })
        .eq('id', event.id);

      if (error) throw error;

      toast.success('Изменения сохранены. Мероприятие отправлено на модерацию.');
      navigate(`/event/${event.id}`);
    } catch (err: any) {
      toast.error('Ошибка: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingEvent) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8 max-w-2xl">
          <Card>
            <CardContent className="p-6">Загрузка...</CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-2xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6 text-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Назад
        </button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Редактировать мероприятие</CardTitle>
            <CardDescription>После сохранения событие снова уйдёт на модерацию</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Название *</Label>
                <Input
                  id="title"
                  placeholder="Название мероприятия"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  placeholder="Расскажите подробнее о мероприятии..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Категория *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date-start">Начало *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="date-start"
                      type="datetime-local"
                      value={dateStart}
                      onChange={(e) => setDateStart(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-end">Окончание</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="date-end"
                      type="datetime-local"
                      value={dateEnd}
                      onChange={(e) => setDateEnd(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Город</Label>
                  <Input
                    id="city"
                    placeholder="Город"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Адрес</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      placeholder="Улица, дом"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lat">Широта</Label>
                    <Input
                      id="lat"
                      type="number"
                      step="any"
                      placeholder="55.7558"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lng">Долгота</Label>
                    <Input
                      id="lng"
                      type="number"
                      step="any"
                      placeholder="37.6173"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Switch id="is-free" checked={isFree} onCheckedChange={setIsFree} />
                  <Label htmlFor="is-free">Бесплатное мероприятие</Label>
                </div>
                {!isFree && (
                  <div className="space-y-2">
                    <Label htmlFor="price">Цена (₽)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Обложка</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                  {imagePreview ? (
                    <div className="space-y-3">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-lg object-cover"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                      >
                        Удалить
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Нажмите для загрузки изображения</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Сохраняем...' : 'Сохранить изменения'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default EditEventPage;
