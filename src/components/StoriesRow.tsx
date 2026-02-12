import { useState, useRef } from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStories } from '@/hooks/useStories';
import { useAuth } from '@/hooks/useAuth';
import StoryViewer from '@/components/StoryViewer';
import CreateStoryModal from '@/components/CreateStoryModal';
import { toast } from 'sonner';

const StoriesRow = () => {
  const { user } = useAuth();
  const { storyGroups, loading, createStory } = useStories();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddStory = () => {
    if (!user) {
      toast.error('Войдите в аккаунт, чтобы добавить историю');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setModalOpen(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreateStory = async (caption: string) => {
    if (!selectedFile) return;
    setUploading(true);
    const { error } = await createStory(selectedFile, caption);
    if (error) {
      toast.error(error);
    } else {
      toast.success('История добавлена!');
    }
    setUploading(false);
    setModalOpen(false);
    setSelectedFile(null);
  };

  const openViewer = (index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
  };

  if (loading && storyGroups.length === 0) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
            <div className="w-12 h-2.5 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {/* Add story button */}
        <motion.button
          onClick={handleAddStory}
          disabled={uploading}
          className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
          whileTap={{ scale: 0.95 }}
        >
          <div className="relative w-16 h-16 rounded-full border-2 border-dashed border-muted-foreground/40 flex items-center justify-center bg-muted/50 group-hover:border-accent transition-colors">
            {uploading ? (
              <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            ) : (
              <Plus className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
            )}
          </div>
          <span className="text-[11px] text-muted-foreground truncate w-16 text-center">
            {uploading ? 'Загрузка...' : 'Добавить'}
          </span>
        </motion.button>

        {/* Story groups */}
        {storyGroups.map((group, index) => (
          <motion.button
            key={group.user_id}
            onClick={() => openViewer(index)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-br from-accent to-[hsl(var(--brand-gold))]">
              <div className="w-full h-full rounded-full border-2 border-background overflow-hidden bg-muted">
                {group.avatar_url ? (
                  <img src={group.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-muted-foreground">
                    {group.display_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground truncate w-16 text-center">
              {group.isOwn ? 'Вы' : group.display_name.split(' ')[0]}
            </span>
          </motion.button>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <CreateStoryModal
        open={modalOpen}
        file={selectedFile}
        onClose={() => {
          setModalOpen(false);
          setSelectedFile(null);
        }}
        onSubmit={handleCreateStory}
        isLoading={uploading}
      />

      {viewerOpen && storyGroups.length > 0 && (
        <StoryViewer
          groups={storyGroups}
          initialGroupIndex={viewerIndex}
          onClose={() => setViewerOpen(false)}
          onStoryDeleted={() => {
            setViewerOpen(false);
          }}
        />
      )}
    </>
  );
};

export default StoriesRow;
