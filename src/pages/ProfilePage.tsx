import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EventCard from '@/components/EventCard';
import { useFavorites } from '@/hooks/useFavorites';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Camera, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Link, Navigate } from 'react-router-dom';
import { INTERESTS } from '@/lib/mock-data';
import BrandPatternGold from '@/components/BrandPatternGold';
import BrandOrnament from '@/components/BrandOrnament';

const ProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [profile, setProfile] = useState<Tables<'profiles'> | null>(null);
  const [myEvents, setMyEvents] = useState<Tables<'events'>[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [favoriteEvents, setFavoriteEvents] = useState<Tables<'events'>[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Edit form state
  const [displayName, setDisplayName] = useState('');
  const [city, setCity] = useState('');
  const [interests, setInterests] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setProfile(data);
        setDisplayName(data.display_name || '');
        setCity(data.city || '');
        setInterests((data.interests as string[]) || []);
      }
      setLoadingProfile(false);
    };

    const fetchMyEvents = async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setMyEvents(data);
      setLoadingEvents(false);
    };

    const fetchFavorites = async () => {
      const { data } = await supabase
        .from('favorites')
        .select('event:events(*)')
        .eq('user_id', user.id);

      if (data) {
        const events = data
          .map((row: { event: Tables<'events'> | null }) => row.event)
          .filter(Boolean) as Tables<'events'>[];
        setFavoriteEvents(events);
      }
      setLoadingFavorites(false);
    };

    fetchProfile();
    fetchMyEvents();
    fetchFavorites();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user || !profile) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName, city, interests })
      .eq('user_id', user.id);

    if (error) {
      toast.error('Не удалось сохранить профиль');
    } else {
      setProfile({ ...profile, display_name: displayName, city, interests });
      toast.success('Профиль обновлён');
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Файл слишком большой (макс. 2 МБ)');
      return;
    }

    setUploadingAvatar(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('event-images')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error('Ошибка загрузки аватара');
      setUploadingAvatar(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('event-images')
      .getPublicUrl(path);

    const avatarUrl = urlData.publicUrl + '?t=' + Date.now();

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('user_id', user.id);

    if (updateError) {
      toast.error('Ошибка обновления профиля');
    } else {
      setProfile((prev) => prev ? { ...prev, avatar_url: avatarUrl } : prev);
      toast.success('Аватар обновлён');
    }
    setUploadingAvatar(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-10 space-y-6 max-w-4xl">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32" />
        </main>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const initials = (profile?.display_name || user.email || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const statusLabels: Record<string, { label: string; color: string }> = {
    draft: { label: 'Черновик', color: 'bg-muted text-muted-foreground' },
    pending: { label: 'На модерации', color: 'bg-brand-gold/10 text-brand-gold' },
    approved: { label: 'Одобрено', color: 'bg-primary/10 text-primary' },
    rejected: { label: 'Отклонено', color: 'bg-accent/10 text-accent' },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Profile hero banner */}
        <div className="relative h-40 md:h-52 bg-primary overflow-hidden">
          <div className="absolute inset-0 opacity-[0.06]">
            <BrandPatternGold className="w-full h-full" />
          </div>
          <motion.div
            className="absolute right-8 bottom-4 opacity-10"
            initial={{ rotate: 15, opacity: 0 }}
            animate={{ rotate: 0, opacity: 0.1 }}
            transition={{ duration: 0.8 }}
          >
            <BrandOrnament className="w-32 h-40" />
          </motion.div>
        </div>

        <div className="container max-w-4xl -mt-16 relative z-10 pb-10">
          {/* Avatar + name */}
          <motion.div
            className="flex items-end gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.display_name || ''} />
                <AvatarFallback className="text-2xl bg-brand-gold text-primary-foreground font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                {uploadingAvatar ? (
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                ) : (
                  <Camera className="h-5 w-5 text-white" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
              </label>
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {loadingProfile ? <Skeleton className="h-7 w-40" /> : (profile?.display_name || 'Пользователь')}
              </h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {profile?.city && (
                <p className="text-sm text-muted-foreground mt-0.5">{profile.city}</p>
              )}
            </div>
          </motion.div>

          <Tabs defaultValue="events" className="space-y-6">
            <TabsList>
              <TabsTrigger value="events">Мои мероприятия ({myEvents.length})</TabsTrigger>
              <TabsTrigger value="favorites">Избранное ({favoriteEvents.length})</TabsTrigger>
              <TabsTrigger value="settings">Настройки</TabsTrigger>
            </TabsList>

            <TabsContent value="events">
              {loadingEvents ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[1, 2].map((i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="aspect-[16/10] rounded-lg" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : myEvents.length > 0 ? (
                <div className="space-y-4">
                  {myEvents.map((event, i) => {
                    const status = statusLabels[event.status] || statusLabels.draft;
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <Card>
                          <CardContent className="p-4 flex items-center gap-4">
                            <img
                              src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200&h=130&fit=crop'}
                              alt={event.title}
                              className="w-24 h-16 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <Link to={`/event/${event.id}`} className="font-medium hover:underline line-clamp-1">
                                {event.title}
                              </Link>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {new Date(event.date_start).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.color}`}>
                              {status.label}
                            </span>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <BrandOrnament className="w-12 h-auto mx-auto mb-4 opacity-30" />
                  <p className="text-muted-foreground mb-3">У вас пока нет мероприятий</p>
                  <Link to="/create">
                    <Button>Создать мероприятие</Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="favorites">
              {loadingFavorites ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[1, 2].map((i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="aspect-[16/10] rounded-lg" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : favoriteEvents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {favoriteEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      isFavorite={isFavorite(event.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <BrandOrnament className="w-12 h-auto mx-auto mb-4 opacity-30" />
                  <p className="text-muted-foreground mb-3">В избранном пока пусто</p>
                  <Link to="/">
                    <Button variant="outline">Перейти к афише</Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Редактирование профиля</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Имя</Label>
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Ваше имя"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Город</Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Ваш город"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Интересы</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {INTERESTS.map((interest) => (
                          <label key={interest} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={interests.includes(interest)}
                              onCheckedChange={(checked) => {
                                setInterests((prev) => {
                                  if (checked) return [...prev, interest];
                                  return prev.filter((i) => i !== interest);
                                });
                              }}
                            />
                            {interest}
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">Выберите интересы, чтобы мы лучше подбирали события.</p>
                    </div>
                    <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Сохранить
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
