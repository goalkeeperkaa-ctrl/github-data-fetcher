import { Sparkles } from 'lucide-react';
import BrandPatternTerracotta from '@/components/BrandPatternTerracotta';
import BrandSwirl from '@/components/BrandSwirl';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-primary p-8 md:p-12 text-primary-foreground">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.07]">
        <BrandPatternTerracotta className="w-full h-full" />
      </div>

      {/* Decorative swirl */}
      <div className="absolute -right-16 -bottom-12 opacity-10">
        <BrandSwirl className="w-64 h-64" />
      </div>

      <div className="relative z-10 max-w-2xl">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-accent" />
          <span className="text-sm font-medium opacity-90">Агрегатор мероприятий</span>
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-3">
          Найди своё <br className="hidden sm:block" />
          следующее событие
        </h1>
        <p className="text-base md:text-lg opacity-85 max-w-lg">
          Концерты, лекции, фестивали, спорт — все мероприятия вашего города в одном месте.
        </p>
      </div>
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/20 blur-2xl" />
    </section>
  );
};

export default HeroSection;
