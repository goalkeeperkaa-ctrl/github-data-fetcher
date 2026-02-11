import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { CATEGORIES } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Check, X, Calendar, MapPin, Eye, ShieldCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type EventStatus = 'pending' | 'approved' | 'rejected';

const ModerationPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Tables<'events'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [activeTab, setActiveTab] = useState<EventStatus>('pending');
  const [previewEvent, setPreviewEvent] = useState<Tables<'events'> | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/auth');
      return;
    }

    const checkRole = async () => {
      const { data } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin',
      });
      const { data: isMod } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'moderator',
      });
      setIsAdmin(data === true || isMod === true);
      setCheckingRole(false);
    };

    checkRole();
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!isAdmin || checkingRole) return;
    fetchEvents();
  }, [isAdmin, checkingRole, activeTab]);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', activeTab)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setEvents(data);
    }
    setLoading(false);
  };

  const updateStatus = async (eventId: string, status: 'approved' | 'rejected') => {
    setActionLoading(eventId);
    const { error } = await supabase
      .from('events')
      .update({ status })
      .eq('id', eventId);

    if (error) {
      toast.error('Ошибка: ' + error.message);
    } else {
      toast.success(status === 'approved' ? 'Мероприятие одобрено!' : 'Мероприятие отклонено');
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      setPreviewEvent(null);
    }
    setActionLoading(null);
  };

  if (authLoading || checkingRole) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12 flex justify-center">
          <p className="text-muted-foreground">Проверка доступа...</p>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12 flex flex-col items-center gap-4">
          <ShieldCheck className="h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium">Доступ запрещён</p>
          <p className="text-sm text-muted-foreground">У вас нет прав модератора</p>
          <Button variant="outline" onClick={() => navigate('/')}>На главную</Button>
        </main>
      </div>
    );
  }

  const cat = (category: string) => CATEGORIES.find((c) => c.value === category);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Модерация мероприятий</h1>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as EventStatus)}>
          <TabsList>
            <TabsTrigger value="pending">⏳ На рассмотрении</TabsTrigger>
            <TabsTrigger value="approved">✅ Одобренные</TabsTrigger>
            <TabsTrigger value="rejected">❌ Отклонённые</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <p className="text-lg font-medium mb-1">Пусто</p>
                <p className="text-sm text-muted-foreground">Нет мероприятий со статусом «{activeTab}»</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event) => {
                  const c = cat(event.category);
                  const date = new Date(event.date_start).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <Card key={event.id} className="overflow-hidden">
                      <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                        {/* Image */}
                        <div className="w-full sm:w-40 h-28 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&h=200&fit=crop'}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-lg leading-tight line-clamp-1">{event.title}</h3>
                            <Badge variant="outline" className="flex-shrink-0">
                              {c?.emoji} {c?.label}
                            </Badge>
                          </div>
                          {event.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {date}
                            </span>
                            {event.city && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {event.city}
                              </span>
                            )}
                            <span>{event.is_free ? 'Бесплатно' : `${event.price} ₽`}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex sm:flex-col gap-2 flex-shrink-0 items-center sm:items-end sm:justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewEvent(event)}
                          >
                            <Eye className="h-4 w-4 mr-1" /> Подробнее
                          </Button>
                          {activeTab === 'pending' && (
                            <>
                               <Button
                                 size="sm"
                                 onClick={() => updateStatus(event.id, 'approved')}
                                 disabled={actionLoading === event.id}
                               >
                                 <Check className="h-4 w-4 mr-1" /> Одобрить
                               </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => updateStatus(event.id, 'rejected')}
                                disabled={actionLoading === event.id}
                              >
                                <X className="h-4 w-4 mr-1" /> Отклонить
                              </Button>
                            </>
                          )}
                          {activeTab === 'rejected' && (
                            <Button
                              size="sm"
                              onClick={() => updateStatus(event.id, 'approved')}
                              disabled={actionLoading === event.id}
                            >
                              <Check className="h-4 w-4 mr-1" /> Одобрить
                            </Button>
                          )}
                          {activeTab === 'approved' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => updateStatus(event.id, 'rejected')}
                              disabled={actionLoading === event.id}
                            >
                              <X className="h-4 w-4 mr-1" /> Отклонить
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Preview dialog */}
        <Dialog open={!!previewEvent} onOpenChange={() => setPreviewEvent(null)}>
          <DialogContent className="max-w-lg">
            {previewEvent && (
              <>
                <DialogHeader>
                  <DialogTitle>{previewEvent.title}</DialogTitle>
                  <DialogDescription>
                    {cat(previewEvent.category)?.emoji} {cat(previewEvent.category)?.label} • {previewEvent.city || 'Город не указан'}
                  </DialogDescription>
                </DialogHeader>
                {previewEvent.image_url && (
                  <img
                    src={previewEvent.image_url}
                    alt={previewEvent.title}
                    className="w-full rounded-lg aspect-video object-cover"
                  />
                )}
                <div className="space-y-3 text-sm">
                  <p>{previewEvent.description || 'Описание отсутствует'}</p>
                  <div className="flex flex-wrap gap-3 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(previewEvent.date_start).toLocaleDateString('ru-RU', {
                        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                    {previewEvent.address && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {previewEvent.address}
                      </span>
                    )}
                  </div>
                  <p className="font-medium">
                    {previewEvent.is_free ? 'Бесплатно' : `${previewEvent.price} ₽`}
                  </p>
                </div>
                {previewEvent.status === 'pending' && (
                   <div className="flex gap-2 pt-2">
                     <Button
                       onClick={() => updateStatus(previewEvent.id, 'approved')}
                       disabled={actionLoading === previewEvent.id}
                     >
                       <Check className="h-4 w-4 mr-1" /> Одобрить
                     </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => updateStatus(previewEvent.id, 'rejected')}
                      disabled={actionLoading === previewEvent.id}
                    >
                      <X className="h-4 w-4 mr-1" /> Отклонить
                    </Button>
                  </div>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default ModerationPage;
