import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AidagisLogo from '@/components/AidagisLogo';
import AidagisWordmark from '@/components/AidagisWordmark';
import BrandPattern from '@/components/BrandPattern';
import BrandOrnament from '@/components/BrandOrnament';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Footer = () => {
  return (
    <footer className="relative overflow-hidden border-t bg-primary text-primary-foreground">
      {/* Decorative ornament */}
      <motion.div
        className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-[0.06]"
        initial={{ rotate: 20, opacity: 0, scale: 0.5 }}
        whileInView={{ rotate: 0, opacity: 0.06, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <BrandOrnament className="w-48 h-60" />
      </motion.div>

      <motion.div
        className="container relative z-10 py-12"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand column */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <Link to="/" className="flex items-center gap-2">
              <AidagisLogo className="h-10 w-auto" />
              <AidagisWordmark className="h-4" />
            </Link>
            <p className="text-sm opacity-70 max-w-xs">
              Агрегатор мероприятий вашего города. Концерты, лекции, фестивали — всё в одном месте.
            </p>
            <BrandPattern className="w-24 h-auto opacity-30" />
          </motion.div>

          {/* Navigation */}
          <motion.div className="space-y-3" variants={itemVariants}>
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
          </motion.div>

          {/* Info */}
          <motion.div className="space-y-3" variants={itemVariants}>
            <h4 className="font-semibold text-sm uppercase tracking-wider opacity-60">Информация</h4>
            <div className="flex flex-col gap-2 text-sm opacity-80">
              <span>Поддержка: info@aidagis.com</span>
              <span>Все права защищены © {new Date().getFullYear()}</span>
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          className="mt-10 pt-6 border-t border-primary-foreground/10 flex items-center justify-between"
          variants={itemVariants}
        >
          <p className="text-xs opacity-50">
            Aidagis — платформа для поиска мероприятий
          </p>
        </motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;
