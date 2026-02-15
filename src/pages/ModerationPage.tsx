import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { CATEGORIES, CITIES } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Check, X, Calendar, Eye, ShieldCheck, Search, CheckCheck, Loader2 } from 'lucide-react';
import BrandPin from '@/components/BrandPin';
import BrandChart from '@/components/BrandChart';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { motion } from 'framer-motion';

type EventStatus = 'pending' | 'approved' | 'rejected';

const ModerationPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [allEvents, setAllEvents] = useState<Tables<'events'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [activeTab, setActiveTab] = useState<EventStatus>('pending');
  const [previewEvent, setPreviewEvent] = useState<Tables<'events'> | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<Tables<'events'> | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Stats
  const stats = useMemo(() => ({
    pending: allEvents.filter((e) => e.status === 'pending').length,
    approved: allEvents.filter((e) => e.status === 'approved').length,
    rejected: allEvents.filter((e) => e.status === 'rejected').length,
    total: allEvents.length,
  }), [allEvents]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/auth'); return; }

    const checkRole = async () => {
      const { data } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
      const { data: isMod } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'moderator' });
      setIsAdmin(data === true || isMod === true);
      setCheckingRole(false);
    };
    checkRole();
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!isAdmin || checkingRole) return;
    fetchAllEvents();
  }, [isAdmin, checkingRole]);

  const fetchAllEvents = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setAllEvents(data);
    setLoading(false);
  };

  const filteredEvents = useMemo(() => {
    return allEvents
      .filter((e) => e.status === activeTab)
      .filter((e) => (selectedCategory === 'all' ? true : e.category === selectedCategory))
      .filter((e) => (selectedCity === 'all' ? true : e.city === selectedCity))
      .filter((e) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          e.title.toLowerCase().includes(q) ||
          (e.city?.toLowerCase().includes(q)) ||
          (e.description?.toLowerCase().includes(q))
        );
      });
  }, [allEvents, activeTab, searchQuery, selectedCategory, selectedCity]);

  const updateStatus = async (eventId: string, status: 'approved' | 'rejected', reason?: string) => {
    setActionLoading(eventId);
    const { error } = await supabase
      .from('events')
      .update({ status, rejection_reason: status === 'rejected' ? (reason || null) : null })
      .eq('id', eventId);
    if (error) {
      toast.error('Ошибка: ' + error.message);
    } else {
      toast.success(status === 'approved' ? 'Мероприятие одобрено!' : 'Мероприятие отклонено');
      setAllEvents((prev) => prev.map((e) => e.id === eventId ? { ...e, status, rejection_reason: status === 'rejected' ? (reason || null) : null } : e));
      setPreviewEvent(null);
      setSelectedIds((prev) => { const n = new Set(prev); n.delete(eventId); return n; });
    }
    setActionLoading(null);
  };

  const handleBulkAction = async (status: 'approved' | 'rejected') => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    const ids = Array.from(selectedIds);

    const { error } = await supabase
      .from('events')
      .update({ status, rejection_reason: status === 'rejected' ? 'Отклонено модерацией' : null })
      .in('id', ids);

    if (error) {
      toast.error('Ошибка массового действия');
    } else {
      toast.success(`${ids.length} мероприятий ${status === 'approved' ? 'одобрено' : 'отклонено'}`);
      setAllEvents((prev) => prev.map((e) => ids.includes(e.id) ? { ...e, status } : e));
      setSelectedIds(new Set());
    }
    setBulkLoading(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredEvents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredEvents.map((e) => e.id)));
    }
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

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Всего', value: stats.total, color: 'text-foreground', icon: <BrandChart className="h-5 w-auto opacity-40" /> },
            { label: 'На модерации', value: stats.pending, color: 'text-brand-gold', icon: <span>⏳</span> },
            { label: 'Одобрено', value: stats.approved, color: 'text-primary', icon: <span>✅</span> },
            { label: 'Отклонено', value: stats.rejected, color: 'text-accent', icon: <span>❌</span> },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="text-xl">{stat.icon}</div>
                  <div>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Search & filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по названию, городу..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-56">
              <SelectValue placeholder="Категория" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все категории</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.emoji} {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="w-full md:w-48">
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
        </div>

        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as EventStatus); setSelectedIds(new Set()); }}>
          <TabsList>
            <TabsTrigger value="pending">⏳ На рассмотрении ({stats.pending})</TabsTrigger>
            <TabsTrigger value="approved">✅ Одобренные ({stats.approved})</TabsTrigger>
            <TabsTrigger value="rejected">❌ Отклонённые ({stats.rejected})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4 space-y-3">
            {/* Bulk actions bar */}
            {filteredEvents.length > 0 && (
              <div className="flex items-center gap-3 py-2">
                <Checkbox
                  checked={selectedIds.size === filteredEvents.length && filteredEvents.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-sm text-muted-foreground">
                  {selectedIds.size > 0 ? `Выбрано: ${selectedIds.size}` : 'Выбрать все'}
                </span>
                {selectedIds.size > 0 && (
                  <div className="flex gap-2 ml-auto">
                    {activeTab !== 'approved' && (
                      <Button size="sm" disabled={bulkLoading} onClick={() => handleBulkAction('approved')}>
                        {bulkLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCheck className="h-4 w-4 mr-1" />}
                        Одобрить все
                      </Button>
                    )}
                    {activeTab !== 'rejected' && (
                      <Button size="sm" variant="destructive" disabled={bulkLoading} onClick={() => handleBulkAction('rejected')}>
                        {bulkLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <X className="h-4 w-4 mr-1" />}
                        Отклонить все
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <BrandPin className="w-12 h-16 mb-3 opacity-20" />
                <p className="text-lg font-medium mb-1">Пусто</p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? 'Ничего не найдено по запросу' : `Нет мероприятий со статусом «${activeTab}»`}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEvents.map((event, i) => {
                  const c = cat(event.category);
                  const date = new Date(event.date_start).toLocaleDateString('ru-RU', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  });

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Card className={`overflow-hidden transition-colors ${selectedIds.has(event.id) ? 'ring-2 ring-primary' : ''}`}>
                        <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                          <div className="flex items-center gap-3 sm:contents">
                            <Checkbox
                              checked={selectedIds.has(event.id)}
                              onCheckedChange={() => toggleSelect(event.id)}
                              className="flex-shrink-0"
                            />
                            <div className="w-full sm:w-40 h-28 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&h=200&fit=crop'}
                                alt={event.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>

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
                            {event.rejection_reason && activeTab === 'rejected' && (
                              <p className="text-xs text-accent">Причина: {event.rejection_reason}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {date}
                              </span>
                              {event.city && (
                                <span className="flex items-center gap-1">
                                  <BrandPin className="h-3.5 w-auto" />
                                  {event.city}
                                </span>
                              )}
                              <span>{event.is_free ? 'Бесплатно' : `${event.price} ₽`}</span>
                            </div>
                          </div>

                          <div className="flex sm:flex-col gap-2 flex-shrink-0 items-center sm:items-end sm:justify-center">
                            <Button variant="ghost" size="sm" onClick={() => setPreviewEvent(event)}>
                              <Eye className="h-4 w-4 mr-1" /> Подробнее
                            </Button>
                            {activeTab === 'pending' && (
                              <>
                                <Button size="sm" onClick={() => updateStatus(event.id, 'approved')} disabled={actionLoading === event.id}>
                                  <Check className="h-4 w-4 mr-1" /> Одобрить
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => { setRejectTarget(event); setRejectReason(''); }} disabled={actionLoading === event.id}>
                                  <X className="h-4 w-4 mr-1" /> Отклонить
                                </Button>
                              </>
                            )}
                            {activeTab === 'rejected' && (
                              <Button size="sm" onClick={() => updateStatus(event.id, 'approved')} disabled={actionLoading === event.id}>
                                <Check className="h-4 w-4 mr-1" /> Одобрить
                              </Button>
                            )}
                            {activeTab === 'approved' && (
                              <Button variant="destructive" size="sm" onClick={() => { setRejectTarget(event); setRejectReason(''); }} disabled={actionLoading === event.id}>
                                <X className="h-4 w-4 mr-1" /> Отклонить
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
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
                  <img src={previewEvent.image_url} alt={previewEvent.title} className="w-full rounded-lg aspect-video object-cover" />
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
                        <BrandPin className="h-3.5 w-auto" />
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
                    <Button onClick={() => updateStatus(previewEvent.id, 'approved')} disabled={actionLoading === previewEvent.id}>
                      <Check className="h-4 w-4 mr-1" /> Одобрить
                    </Button>
                    <Button variant="destructive" className="flex-1" onClick={() => { setRejectTarget(previewEvent); setRejectReason(''); }} disabled={actionLoading === previewEvent.id}>
                      <X className="h-4 w-4 mr-1" /> Отклонить
                    </Button>
                  </div>
                )}
                {previewEvent.rejection_reason && (
                  <p className="text-sm text-muted-foreground">Причина: {previewEvent.rejection_reason}</p>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={!!rejectTarget} onOpenChange={() => setRejectTarget(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Причина отклонения</DialogTitle>
              <DialogDescription>Опишите кратко, почему мероприятие отклонено.</DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="Например: не хватает адреса или описание слишком краткое"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setRejectTarget(null)}>Отмена</Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (!rejectTarget) return;
                  await updateStatus(rejectTarget.id, 'rejected', rejectReason);
                  setRejectTarget(null);
                }}
                disabled={actionLoading === rejectTarget?.id}
              >
                Отклонить
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default ModerationPage;
