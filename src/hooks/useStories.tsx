import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Story {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
  expires_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface StoryGroup {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  stories: Story[];
  isOwn: boolean;
}

export const useStories = () => {
  const { user } = useAuth();
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStories = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      setLoading(false);
      return;
    }

    // Fetch profiles for story authors
    const userIds = [...new Set(data.map((s) => s.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, display_name, avatar_url')
      .in('user_id', userIds);

    const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) ?? []);

    // Group stories by user
    const groups = new Map<string, StoryGroup>();
    for (const story of data) {
      const profile = profileMap.get(story.user_id);
      if (!groups.has(story.user_id)) {
        groups.set(story.user_id, {
          user_id: story.user_id,
          display_name: profile?.display_name ?? 'Пользователь',
          avatar_url: profile?.avatar_url ?? null,
          stories: [],
          isOwn: story.user_id === user?.id,
        });
      }
      groups.get(story.user_id)!.stories.push(story);
    }

    // Put own stories first
    const sorted = [...groups.values()].sort((a, b) => {
      if (a.isOwn) return -1;
      if (b.isOwn) return 1;
      return new Date(b.stories[0].created_at).getTime() - new Date(a.stories[0].created_at).getTime();
    });

    setStoryGroups(sorted);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const createStory = async (file: File, caption?: string) => {
    if (!user) return { error: 'Нужно войти в аккаунт' };

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('story-images')
      .upload(filePath, file);

    if (uploadError) return { error: uploadError.message };

    const { data: urlData } = supabase.storage
      .from('story-images')
      .getPublicUrl(filePath);

    const { error: insertError } = await supabase
      .from('stories')
      .insert({
        user_id: user.id,
        image_url: urlData.publicUrl,
        caption: caption || null,
      });

    if (insertError) return { error: insertError.message };

    await fetchStories();
    return { error: null };
  };

  return { storyGroups, loading, createStory, refetch: fetchStories };
};
