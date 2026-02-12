import { motion } from 'framer-motion';
import BrandPatternTerracotta from '@/components/BrandPatternTerracotta';
import BrandSwirl from '@/components/BrandSwirl';
import BrandOrnament from '@/components/BrandOrnament';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-primary p-8 md:p-12 text-primary-foreground">
      {/* Background pattern */}
      <motion.div
        className="absolute inset-0 opacity-[0.07]"
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.07 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        <BrandPatternTerracotta className="w-full h-full" />
      </motion.div>

      {/* Decorative swirl */}
      <motion.div
        className="absolute -right-16 -bottom-12 opacity-10"
        initial={{ rotate: -30, opacity: 0, scale: 0.6 }}
        animate={{ rotate: 0, opacity: 0.1, scale: 1 }}
        transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
      >
        <BrandSwirl className="w-64 h-64" />
      </motion.div>

      <div className="relative z-10 max-w-2xl">
        <motion.div
          className="flex items-center gap-2 mb-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <BrandOrnament className="h-5 w-auto text-accent" />
          <span className="text-sm font-medium opacity-90">Агрегатор мероприятий</span>
        </motion.div>
        <motion.h1
          className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Найди своё <br className="hidden sm:block" />
          следующее событие
        </motion.h1>
        <motion.p
          className="text-base md:text-lg opacity-85 max-w-lg"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Концерты, лекции, фестивали, спорт — все мероприятия вашего города в одном месте.
        </motion.p>
      </div>

      <motion.div
        className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/20 blur-2xl"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.3 }}
      />
    </section>
  );
};

export default HeroSection;
