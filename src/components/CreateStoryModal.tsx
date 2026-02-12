import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CreateStoryModalProps {
  open: boolean;
  file: File | null;
  onClose: () => void;
  onSubmit: (caption: string) => Promise<void>;
  isLoading?: boolean;
}

const CreateStoryModal = ({ open, file, onClose, onSubmit, isLoading }: CreateStoryModalProps) => {
  const [caption, setCaption] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string>('');

  if (!file && !previewUrl) return null;

  // Generate preview on mount
  if (file && !previewUrl) {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  const handleSubmit = async () => {
    await onSubmit(caption);
    setCaption('');
    setPreviewUrl('');
  };

  const handleClose = () => {
    setCaption('');
    setPreviewUrl('');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="bg-card rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Preview */}
            <div className="relative aspect-video bg-muted overflow-hidden">
              {previewUrl && (
                <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
              )}
              <button
                onClick={handleClose}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Подпись к истории (необязательно)
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Добавьте текст..."
                  maxLength={150}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {caption.length}/150
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Отмена
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Загрузка...' : 'Опубликовать'}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateStoryModal;
