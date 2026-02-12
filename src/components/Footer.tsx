import { Link } from 'react-router-dom';
import AidagisLogo from '@/components/AidagisLogo';
import AidagisWordmark from '@/components/AidagisWordmark';
import BrandPattern from '@/components/BrandPattern';
import BrandOrnament from '@/components/BrandOrnament';

const Footer = () => {
  return (
    <footer className="relative overflow-hidden border-t bg-primary text-primary-foreground">
      {/* Decorative ornament */}
      <div className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-[0.06]">
        <BrandOrnament className="w-48 h-60" />
      </div>

      <div className="container relative z-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand column */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <AidagisLogo className="h-10 w-auto" />
              <AidagisWordmark className="h-4" />
            </Link>
            <p className="text-sm opacity-70 max-w-xs">
              Агрегатор мероприятий вашего города. Концерты, лекции, фестивали — всё в одном месте.
            </p>
            <BrandPattern className="w-24 h-auto opacity-30" />
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm uppercase tracking-wider opacity-60">Навигация</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                Мероприятия
              </Link>
              <Link to="/map" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                Карта
              </Link>
              <Link to="/create" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                Создать событие
              </Link>
              <Link to="/favorites" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                Избранное
              </Link>
            </nav>
          </div>

          {/* Info */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm uppercase tracking-wider opacity-60">Информация</h4>
            <div className="flex flex-col gap-2 text-sm opacity-80">
              <span>Поддержка: info@aidagis.com</span>
              <span>Все права защищены © {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-primary-foreground/10 flex items-center justify-between">
          <p className="text-xs opacity-50">
            Aidagis — платформа для поиска мероприятий
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
