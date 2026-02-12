import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import type { StoryGroup } from '@/hooks/useStories';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StoryViewerProps {
  groups: StoryGroup[];
  initialGroupIndex: number;
  onClose: () => void;
  onStoryDeleted?: () => void;
}

const STORY_DURATION = 5000;

const StoryViewer = ({ groups, initialGroupIndex, onClose, onStoryDeleted }: StoryViewerProps) => {
  const { user } = useAuth();
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const group = groups[groupIndex];
  const story = group?.stories[storyIndex];

  const goNext = useCallback(() => {
    if (storyIndex < group.stories.length - 1) {
      setStoryIndex((i) => i + 1);
      setProgress(0);
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex((i) => i + 1);
      setStoryIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  }, [storyIndex, groupIndex, group?.stories.length, groups.length, onClose]);

  const goPrev = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex((i) => i - 1);
      setProgress(0);
    } else if (groupIndex > 0) {
      setGroupIndex((i) => i - 1);
      setStoryIndex(groups[groupIndex - 1].stories.length - 1);
      setProgress(0);
    }
  }, [storyIndex, groupIndex, groups]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          goNext();
          return 0;
        }
        return p + 100 / (STORY_DURATION / 50);
      });
    }, 50);
    return () => clearInterval(interval);
  }, [goNext, storyIndex, groupIndex]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, onClose]);

  if (!story) return null;

  const handleDelete = async () => {
    if (!story) return;
    setDeleting(true);
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', story.id)
      .eq('user_id', user?.id);

    if (error) {
      toast.error('Не удалось удалить историю');
      setDeleting(false);
    } else {
      toast.success('История удалена');
      onStoryDeleted?.();
      // Move to next story or close
      if (storyIndex < group.stories.length - 1) {
        setStoryIndex((i) => i + 1);
      } else if (groupIndex < groups.length - 1) {
        setGroupIndex((i) => i + 1);
        setStoryIndex(0);
      } else {
        onClose();
      }
      setDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white/80 hover:text-white transition-colors"
        >
          <X className="h-7 w-7" />
        </button>

        {/* Delete button (only for own stories) */}
        {group.isOwn && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="absolute top-4 left-4 z-10 text-accent/90 hover:text-accent transition-colors disabled:opacity-50"
            title="Удалить историю"
          >
            <Trash2 className="h-6 w-6" />
          </button>
        )}

        {/* Navigation arrows */}
        {(groupIndex > 0 || storyIndex > 0) && (
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-10 w-10" />
          </button>
        )}
        {(groupIndex < groups.length - 1 || storyIndex < group.stories.length - 1) && (
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white/60 hover:text-white transition-colors"
          >
            <ChevronRight className="h-10 w-10" />
          </button>
        )}

        {/* Story content */}
        <div className="relative w-full max-w-md h-[80vh] rounded-2xl overflow-hidden">
          {/* Progress bars */}
          <div className="absolute top-3 left-3 right-3 z-10 flex gap-1">
            {group.stories.map((_, i) => (
              <div key={i} className="flex-1 h-0.5 rounded-full bg-white/30 overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-75"
                  style={{
                    width: i < storyIndex ? '100%' : i === storyIndex ? `${progress}%` : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Author info */}
          <div className="absolute top-8 left-3 z-10 flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-white/20 overflow-hidden border border-white/30">
              {group.avatar_url ? (
                <img src={group.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-white text-xs font-semibold">
                  {group.display_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-white text-sm font-medium drop-shadow">{group.display_name}</span>
          </div>

          {/* Image */}
          <motion.img
            key={story.id}
            src={story.image_url}
            alt={story.caption ?? ''}
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          />

          {/* Caption */}
          {story.caption && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
              <p className="text-white text-sm drop-shadow">{story.caption}</p>
            </div>
          )}

          {/* Tap zones */}
          <div className="absolute inset-0 flex">
            <div className="w-1/3 h-full cursor-pointer" onClick={goPrev} />
            <div className="w-1/3 h-full" />
            <div className="w-1/3 h-full cursor-pointer" onClick={goNext} />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StoryViewer;
